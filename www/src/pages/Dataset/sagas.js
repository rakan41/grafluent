import axios from "axios";
import qs from "query-string";
import { eventChannel } from "redux-saga";
import {
  take,
  select,
  call,
  put,
  race,
  delay,
  fork,
  takeEvery,
} from "redux-saga/effects";

const edgeEndpoint =
  process.env.REACT_APP_EDGE_ENDPOINT || "http://localhost:3878";

function* loadDataset(action) {
  const { authToken } = yield select((state) => ({
    authToken: state.app.auth,
  }));
  try {
    const { data } = yield axios.get(
      `${edgeEndpoint}/projects/${action.id}/docs`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );
    yield put({ type: "LOAD_DATASET_SUCCESS", data });
  } catch (e) {
    console.log("error!", e);
    if (e.response && e.response.data && e.response.data.message) {
      yield put({
        type: "LOAD_DATASET_FAILED",
        message: e.response.data.message,
      });
      return;
    }
    yield put({
      type: "LOAD_DATASET_FAILED",
      message: "Internal Server Error",
    });
  }
}

function createStatusChannel(address) {
  return eventChannel((emit) => {
    const es = new EventSource(address);
    es.onmessage = (e) => emit(parseInt(e.data, 10));
    es.onerror = (e) => {
      console.log("EventSource error", e);
      emit(-1);
    };
    return () => {
      es.close();
    };
  });
}

function* processDocument(file, project) {
  yield put({ type: "UPLOAD_PROCESSING", name: file });
  const { authToken, configs } = yield select((state) => ({
    authToken: state.app.auth,
    configs: state.data.configs,
  }));

  const configParams = {};
  Object.keys(configs).forEach(
    (key) => (configParams[key] = `${configs[key]}`)
  );
  const params = qs.stringify({
    auth: authToken,
    ...configParams,
  });
  const channel = yield call(
    createStatusChannel,
    `${edgeEndpoint}/projects/${project}/docs/${file}/status?${params}`
  );

  while (true) {
    const percent = yield take(channel);
    if (percent === 100) break;
    if (percent === -1) {
      channel.close();
      yield put({
        type: "UPLOAD_ERROR",
        name: file,
        project,
        message: "NLP engine processing failed.",
      });
      return;
    }
    yield put({
      type: "UPLOAD_PROGRESS",
      name: file,
      progress: percent,
    });
  }
  channel.close();
  yield put({
    type: "UPLOAD_COMPLETE",
    name: file,
    project,
  });
}

function* uploadDocument(action) {
  const { authToken } = yield select((state) => ({
    authToken: state.app.auth,
  }));
  try {
    const blob = yield window.fetch(action.content).then((r) => r.blob());
    const { data: uploadDetails } = yield axios.put(
      `${edgeEndpoint}/projects/${action.id}/docs/${action.name}`,
      blob,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );
    yield delay(1500);
    yield call(processDocument, action.name, action.id);
  } catch (e) {
    console.log("error!", e);
    yield put({
      type: "UPLOAD_ERROR",
      name: action.name,
      project: action.id,
      message: "Upload Failed!",
    });
  }
}

function* addAPI(action) {
  const { api, keyword, project, file } = action;
  const { authToken } = yield select((state) => ({
    authToken: state.app.auth,
  }));
  let fileName = file;

  try {
    const { data } = yield axios.post(
      `${edgeEndpoint}/projects/${project}/api/${api}`,
      { keyword },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );
    fileName = data.file;
    if (fileName !== file) {
      console.log("File name is changed!");
      yield put({ type: "UPDATE_FILENAME", from: file, to: fileName });
    }
    yield delay(1500);
    console.log("filename", data.file);
    yield call(processDocument, fileName, project);
  } catch (e) {
    console.log("error!", e);
    if (e.response && e.response.data && e.response.data.message) {
      yield put({
        type: "UPLOAD_ERROR",
        name: fileName,
        project,
        message: e.response.data.message,
      });
      return;
    }
    yield put({
      type: "UPLOAD_ERROR",
      name: fileName,
      project,
      message: `Unknown Error: ${e.message}`,
    });
  }
}

function* dataSaga() {
  yield takeEvery("LOAD_DATASET", loadDataset);
  yield takeEvery("UPLOAD_DOCUMENT", uploadDocument);
  yield takeEvery("ADD_DATASOURCE_API", addAPI);
}

export { dataSaga };
