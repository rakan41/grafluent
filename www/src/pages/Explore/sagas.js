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
import { mapEdges, mapVertices, mapVerticesWithLocation } from "./data-mapper";

import edges from "./taliban_edges.json";
import vertices from "./taliban_vertices.json";

const uuid = require("uuid");

const edgeEndpoint =
  process.env.REACT_APP_EDGE_ENDPOINT || "http://localhost:3878";
const graphEndpoint =
  process.env.REACT_APP_GRAPH_ENDPOINT || "http://localhost:8877";

function* hideScrollAnimation(action) {
  yield delay(3000);
  yield put({ type: "HIDE_SCROLL_SUCCESS" });
}

function* shareGraph(action) {
  const data = yield select((state) => state.explore.data);
  try {
    const rawRes = yield axios.post(graphEndpoint, data);
    const { id } = rawRes.data;

    switch (action.kind) {
      case "download":
        window.open(`${graphEndpoint}/images/${id}`, "Download");
        break;
      case "facebook":
        window.open(
          `https://www.facebook.com/sharer.php?s=100&p[title]=Donald+Trump&p[summary]=Hi+Donald&p[url]=${graphEndpoint}/images/${id}&p[images][0]=${graphEndpoint}/images/${id}`,
          "sharer",
          "toolbar=0,status=0,width=580,height=325"
        );
        break;
      case "twitter":
        window.open(
          `http://twitter.com/share?text=Donald+Trump&url=${graphEndpoint}/images/${id}`,
          "sharer",
          "toolbar=0,status=0,width=580,height=325"
        );
        break;
    }
    yield put({ type: "SHARE_GRAPH_SUCCESS" });
  } catch (e) {
    yield put({ type: "SHARE_GRAPH_FAILED" });
  }
}

function* expandNode(action) {
  try {
    const {
      authToken,
      configRelationship,
      configEntityType,
      configDepth,
      configExpandResultLimit,
      cursor,
      oldNodes,
      oldLinks,
    } = yield select((state) => ({
      authToken: state.app.auth,
      configEntityType: state.explore.configEntityType,
      configRelationship: state.explore.configRelationship,
      configDepth: state.explore.configDepth,
      configExpandResultLimit: state.explore.configExpandResultLimit,
      cursor: action.cursorId ? state.explore.cursors[action.cursorId] : null,
      oldNodes: state.explore.data ? state.explore.data.nodes : [],
      oldLinks: state.explore.data ? state.explore.data.links : [],
    }));
    const params = {
      search: action.query,
      depth: configDepth,
      limit: configExpandResultLimit,
    };
    if (configEntityType !== "ALL") params.entityType = configEntityType;
    if (configRelationship === "SAME DOCUMENT")
      params.relationshipType = "same_document";
    else params.relationshipType = "same_sentence";

    if (cursor) params.offset = cursor.next;

    const { data } = yield axios.get(
      `${edgeEndpoint}/projects/${action.project}/entities/${action.entity}`,
      {
        params,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const nodeSet = new Set(oldNodes.map((node) => node.id));
    const linkSet = {};
    for (const { source, target } of oldLinks) {
      if (!linkSet[source]) linkSet[source] = {};
      linkSet[source][target] = true;
    }

    const nodes = data[0].vertices
      .map(mapVertices)
      .filter((node) => !nodeSet.has(node.id));
    const links = data[0].edges
      .map(mapEdges)
      .filter(
        ({ source, target }) => !(linkSet[source] && linkSet[source][target])
      );
    const cursorId = uuid.v4();
    nodes.push({
      id: cursorId,
      kind: "SYSTEM_EXPAND",
      labelProperty: "label",
      label: "Next Page",
    });
    links.push({
      source: cursorId,
      target: action.entity,
    });

    yield put({
      type: "EXPAND_QUERY_RESULT",
      id: action.id,
      entitiesCount: data[0].vertices.length,
      data: {
        nodes,
        links,
      },
      cursor: {
        id: cursorId,
        root: action.entity,
        nodes,
        links,
        next: cursor
          ? cursor.next + configExpandResultLimit
          : configExpandResultLimit,
      },
      prevCursor: cursor,
    });
  } catch (e) {
    console.log("Error when executing query", e);
    if (e.response && e.response.data && e.response.data.message) {
      yield put({
        type: "EXECUTE_QUERY_ERROR",
        id: action.id,
        message: e.response.data.message,
      });
      return;
    }
    yield put({
      type: "EXECUTE_QUERY_ERROR",
      id: action.id,
      message:
        "We have difficulty processing your query right now. Please try again later",
    });
  }
}

function* executeTopEntities(action) {
  try {
    const {
      authToken,
      configEntityType,
      configExpandResultLimit,
    } = yield select((state) => ({
      authToken: state.app.auth,
      configEntityType: state.explore.configEntityType,
      configExpandResultLimit: state.explore.configExpandResultLimit,
    }));
    const params = {
      limit: configExpandResultLimit,
    };

    if (configEntityType !== "ALL") params.type = configEntityType;
    const { data } = yield axios.get(
      `${edgeEndpoint}/projects/${action.project}/top`,
      {
        params,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );
    yield put({
      type: "EXECUTE_QUERY_RESULT",
      id: action.id,
      entitiesCount: data.length,
      data: {
        nodes: data.map(mapVerticesWithLocation),
        links: [],
      },
    });
  } catch (e) {
    console.log("Error when executing query", e);
    if (e.response && e.response.data && e.response.data.message) {
      yield put({
        type: "EXECUTE_QUERY_ERROR",
        id: action.id,
        message: e.response.data.message,
      });
      return;
    }
    yield put({
      type: "EXECUTE_QUERY_ERROR",
      id: action.id,
      message:
        "We have difficulty processing your query right now. Please try again later",
    });
  }
}

function* executeLucky(action) {
  try {
    const { authToken, configEntityType, configResultLimit } = yield select(
      (state) => ({
        authToken: state.app.auth,
        configEntityType: state.explore.configEntityType,
        configResultLimit: state.explore.configResultLimit,
      })
    );
    const params = {
      limit: configResultLimit,
    };

    if (configEntityType !== "ALL") params.type = configEntityType;

    const { data } = yield axios.get(
      `${edgeEndpoint}/projects/${action.project}/luckbox`,
      {
        params,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );
    yield put({
      type: "EXECUTE_QUERY_RESULT",
      id: action.id,
      entitiesCount: data.length,
      data: {
        nodes: data.map(mapVerticesWithLocation),
        links: [],
      },
    });
  } catch (e) {
    console.log("Error when executing query", e);
    if (e.response && e.response.data && e.response.data.message) {
      yield put({
        type: "EXECUTE_QUERY_ERROR",
        id: action.id,
        message: e.response.data.message,
      });
      return;
    }
    yield put({
      type: "EXECUTE_QUERY_ERROR",
      id: action.id,
      message:
        "We have difficulty processing your query right now. Please try again later",
    });
  }
}

function* loadEdgeDocument(action) {
  if (action.type === "OPEN_INFO_BOX" && action.kind !== "RELATIONSHIP") return;
  try {
    const { authToken, edge } = yield select((state) => ({
      authToken: state.app.auth,
      edge: state.explore.edges[action.source][action.dest],
    }));

    const params = {
      type: edge.kind,
    };

    if (action.type === "LOAD_EDGE_DOCUMENT") params.full = "true";

    const { data } = yield axios.get(
      `${edgeEndpoint}/projects/${action.project}/edges/${edge.key}`,
      {
        params,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );
    yield put({
      type: "INFOBOX_EDGE_TEXT",
      data,
    });
  } catch (e) {
    console.log("Error when loading edge text", e);
    if (e.response && e.response.data && e.response.data.message) {
      yield put({
        type: "INFOBOX_EDGE_TEXT",
        data: null,
      });
      return;
    }
    yield put({
      type: "INFOBOX_EDGE_TEXT",
      data: null,
    });
  }
}

function* loadTopNeighbours(action) {
  if (action.kind !== "ENTITY") return;
  try {
    const {
      authToken,
      configRelationship,
      configEntityType,
      configDepth,
    } = yield select((state) => ({
      authToken: state.app.auth,
      configEntityType: state.explore.configEntityType,
      configRelationship: state.explore.configRelationship,
      configDepth: state.explore.configDepth,
    }));

    const params = {
      search: action.query,
      depth: configDepth,
      limit: 5,
    };
    if (configEntityType !== "ALL") params.entityType = configEntityType;
    if (configRelationship === "SAME DOCUMENT")
      params.relationshipType = "same_document";
    else params.relationshipType = "same_sentence";

    const { data } = yield axios.get(
      `${edgeEndpoint}/projects/${action.project}/entities/${action.id}/neighbours`,
      {
        params,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );
    yield put({
      type: "INFOBOX_TOP_NEIGHBOURS",
      data: data.map(mapVertices),
    });
  } catch (e) {
    console.log("Error when loading top neighbours", e);
    if (e.response && e.response.data && e.response.data.message) {
      yield put({
        type: "INFOBOX_TOP_NEIGHBOURS",
        data: [],
      });
      return;
    }
    yield put({
      type: "INFOBOX_TOP_NEIGHBOURS",
      data: [],
    });
  }
}

function* executeQuery(action) {
  try {
    const { authToken, configEntityType, configResultLimit } = yield select(
      (state) => ({
        authToken: state.app.auth,
        configEntityType: state.explore.configEntityType,
        configResultLimit: state.explore.configResultLimit,
      })
    );
    const params = {
      search: action.query,
      limit: configResultLimit,
    };

    if (configEntityType !== "ALL") params.type = configEntityType;

    const { data } = yield axios.get(
      `${edgeEndpoint}/projects/${action.project}/entities`,
      {
        params,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );
    yield put({
      type: "EXECUTE_QUERY_RESULT",
      id: action.id,
      entitiesCount: data.length,
      data: {
        nodes: data.map(mapVerticesWithLocation),
        links: [],
      },
    });
  } catch (e) {
    console.log("Error when executing query", e);
    if (e.response && e.response.data && e.response.data.message) {
      yield put({
        type: "EXECUTE_QUERY_ERROR",
        id: action.id,
        message: e.response.data.message,
      });
      return;
    }
    yield put({
      type: "EXECUTE_QUERY_ERROR",
      id: action.id,
      message:
        "We have difficulty processing your query right now. Please try again later",
    });
  }
}

function* executeQueryDummy(action) {
  const donald = {
    id: "Donald Trump",
    size: 750,
    image:
      "https://images.weserv.nl/?mask=circle&w=250&h=250&fit=cover&url=ssl:upload.wikimedia.org/wikipedia/commons/thumb/5/56/Donald_Trump_official_portrait.jpg/946px-Donald_Trump_official_portrait.jpg",
  };
  const biden = {
    id: "Joe Biden",
    size: 450,
    image:
      "https://images.weserv.nl/?mask=circle&w=150&h=150&fit=cover&url=ssl:upload.wikimedia.org/wikipedia/commons/a/ad/Joe_Biden_%2848548455397%29_%28rotated%29.jpg",
  };

  if (action.query === "Taliban") {
    yield delay(1230);
    yield put({
      type: "EXECUTE_QUERY_RESULT",
      id: action.id,
      entitiesCount: vertices.length,
      data: {
        nodes: vertices.map(mapVertices),
        links: edges.map(mapEdges),
      },
    });
  } else if (action.query === "Donald Trump") {
    yield delay(1230);
    yield put({
      type: "EXECUTE_QUERY_RESULT",
      id: action.id,
      entitiesCount: 1,
      data: {
        nodes: [
          donald,
          {
            id: "Rivals",
            size: 500,
            color: "darkred",
            kind: "SYSTEM_EXPAND",
          },
          { id: "Places", size: 500, color: "darkred", kind: "SYSTEM_EXPAND" },
        ],
        links: [
          {
            source: "Donald Trump",
            target: "Rivals",
            color: "#ff8a8a",
          },
          {
            source: "Donald Trump",
            target: "Places",
            color: "#ff8a8a",
          },
        ],
      },
    });
  } else if (action.query === "Donald Trump's TOP 5 Rivals") {
    yield delay(3200);
    yield put({
      type: "EXECUTE_QUERY_RESULT",
      id: action.id,
      entitiesCount: 4,
      data: {
        nodes: [
          donald,
          biden,
          { id: "Hillary Clinton", kind: "PERSON" },
          { id: "Michael Jackson", size: 400, kind: "PERSON" },
          { id: "Bob Marley", kind: "PERSON" },
        ],
        links: [
          { source: "Donald Trump", target: "Joe Biden", color: "#f5ed93" },
          {
            source: "Donald Trump",
            target: "Hillary Clinton",
            color: "#f5ed93",
          },
          {
            source: "Donald Trump",
            target: "Michael Jackson",
            color: "#ff8a8a",
          },
          { source: "Donald Trump", target: "Bob Marley", color: "#8af2f1" },
        ],
      },
    });
  } else {
    yield delay(2200);
    yield put({
      type: "EXECUTE_QUERY_RESULT",
      id: action.id,
      entitiesCount: 3,
      data: {
        nodes: [
          donald,
          biden,
          { id: "Hillary Clinton", kind: "PERSON" },
          { id: "Michael Jackson", size: 400, kind: "PERSON" },
          { id: "Bob Marley", size: 600, kind: "PERSON" },
          { id: "White House", kind: "ORG" },
          { id: "Pentagon", kind: "ORG" },
          { id: "Oval Office", kind: "PLACE" },
        ],
        links: [
          { source: "Donald Trump", target: "Joe Biden", color: "#f5ed93" },
          {
            source: "Donald Trump",
            target: "Hillary Clinton",
            color: "#f5ed93",
          },
          {
            source: "Donald Trump",
            target: "Michael Jackson",
            color: "#ff8a8a",
          },
          { source: "Donald Trump", target: "Bob Marley", color: "#8af2f1" },
          { source: "Bob Marley", target: "White House", color: "#92deb1" },
          { source: "Bob Marley", target: "Pentagon", color: "#92deb1" },
          { source: "Bob Marley", target: "Oval Office", color: "#92deb1" },
        ],
      },
    });
  }
}

function* exploreSaga() {
  yield takeEvery("LOAD_EDGE_DOCUMENT", loadEdgeDocument);
  yield takeEvery("OPEN_INFO_BOX", loadEdgeDocument);
  yield takeEvery("OPEN_INFO_BOX", loadTopNeighbours);
  yield takeEvery("HIDE_SCROLL_ANIMATION", hideScrollAnimation);
  yield takeEvery("EXECUTE_TOP_ENTITIES", executeTopEntities);
  yield takeEvery("EXECUTE_LUCKY", executeLucky);
  yield takeEvery("EXECUTE_QUERY", executeQuery);
  yield takeEvery("EXPAND_NODE", expandNode);
  yield takeEvery("SHARE_GRAPH", shareGraph);
}

export { exploreSaga };
