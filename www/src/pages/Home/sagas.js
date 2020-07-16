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
import axios from "axios";

const edgeEndpoint =
  process.env.REACT_APP_EDGE_ENDPOINT || "http://localhost:3878";

function* createProject(action) {
  try {
    const { authToken } = yield select((state) => ({
      authToken: state.app.auth,
    }));
    yield axios.post(
      `${edgeEndpoint}/projects`,
      {
        name: action.name,
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );
    yield put({
      type: "CREATE_PROJECT_SUCCESS",
      id: action.name,
    });
  } catch (e) {
    console.log(e);
    if (e.response && e.response.data && e.response.data.message) {
      yield put({
        type: "CREATE_PROJECT_ERROR",
        message: e.response.data.message,
      });
      return;
    }
    yield put({
      type: "CREATE_PROJECT_ERROR",
      message: "Internal Server Error",
    });
  }
}

function* loadProjects(action) {
  try {
    const { authToken } = yield select((state) => ({
      authToken: state.app.auth,
    }));
    const { data } = yield axios.get(`${edgeEndpoint}/projects`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    yield delay(1500);
    yield put({
      type: "LOAD_PROJECTS_SUCCESS",
      data,
    });
  } catch (e) {
    if (e.response && e.response.data && e.response.data.message) {
      yield put({
        type: "LOAD_PROJECTS_ERROR",
        message: e.response.data.message,
      });
      return;
    }
    yield put({
      type: "LOAD_PROJECTS_ERROR",
      message: "Internal Server Error",
    });
  }
}

function* homeSaga() {
  yield takeEvery("CREATE_PROJECT", createProject);
  yield takeEvery("LOAD_PROJECTS", loadProjects);
}

export { homeSaga };
