const moment = require("moment");
const update = require("immutability-helper");

const initialState = {
  error: null,
  configEntityType: "ALL",
  configResultLimit: 1,
  configExpandResultLimit: 10,
  configRelationship: "SAME SENTENCE",
  configNextPageBehaviour: "KEEP",
  configDepth: 1,
  showShareDialog: false,
  shareLoading: false,
  info: null,
  loading: false,
  error: null,
  edges: {},
  entities: {},
  cursors: {},
  queries: {},
  history: [],
  data: null,
  runHelp: false,
};

function explore(state = initialState, action) {
  switch (action.type) {
    case "START_EXPLORE_HELP": {
      return update(state, {
        runHelp: {
          $set: true,
        },
      });
    }
    case "STOP_EXPLORE_HELP": {
      return update(state, {
        runHelp: {
          $set: false,
        },
      });
    }
    case "UPDATE_CONFIG_NEXT_PAGE": {
      return update(state, {
        configNextPageBehaviour: {
          $set: action.value,
        },
      });
    }
    case "UPDATE_CONFIG_ENTITY": {
      return update(state, {
        configEntityType: {
          $set: action.value,
        },
      });
    }
    case "UPDATE_CONFIG_LIMIT": {
      return update(state, {
        configResultLimit: {
          $set: action.value,
        },
      });
    }
    case "UPDATE_CONFIG_EXPAND_LIMIT": {
      return update(state, {
        configExpandResultLimit: {
          $set: action.value,
        },
      });
    }
    case "UPDATE_CONFIG_RELATIONSHIP": {
      return update(state, {
        configRelationship: {
          $set: action.value,
        },
      });
    }
    case "UPDATE_CONFIG_DEPTH": {
      return update(state, {
        configDepth: {
          $set: action.value,
        },
      });
    }
    case "CLOSE_SHARE_DIALOG": {
      return update(state, {
        showShareDialog: {
          $set: false,
        },
      });
    }
    case "OPEN_SHARE_GRAPH": {
      return update(state, {
        showShareDialog: {
          $set: true,
        },
      });
    }
    case "SHARE_GRAPH": {
      return update(state, {
        showShareDialog: { $set: false },
        shareLoading: { $set: true },
      });
    }
    case "SHARE_GRAPH_SUCCESS": {
      return update(state, {
        shareLoading: {
          $set: false,
        },
      });
    }
    case "OPEN_INFO_BOX": {
      if (action.kind === "ENTITY")
        return update(state, {
          info: {
            $set: {
              id: action.id,
              kind: action.kind,
              name: state.entities[action.id].label,
              type: state.entities[action.id].kind.capitalize(),
              image: state.entities[action.id].image,
              summary: state.entities[action.id].summary,
              neighbours: {
                loading: true,
              },
            },
          },
        });

      return update(state, {
        info: {
          $set: {
            source: action.source,
            dest: action.dest,
            sourceName: `${
              state.entities[action.source].label
            } (${state.entities[action.source].kind.capitalize()})`,
            destName: `${state.entities[action.dest].label} (${state.entities[
              action.dest
            ].kind.capitalize()})`,
            file:
              state.edges[action.source] &&
              state.edges[action.source][action.dest]
                ? state.edges[action.source][action.dest].file
                : null,
            offset:
              state.edges[action.source] &&
              state.edges[action.source][action.dest]
                ? state.edges[action.source][action.dest].offset
                : null,
            semanticType:
              state.edges[action.source] &&
              state.edges[action.source][action.dest]
                ? state.edges[action.source][action.dest].semanticType
                : null,
            kind: action.kind,
            loading: true,
            clipText: null,
            text: null,
            title: null,
            date: null,
          },
        },
      });
    }
    case "LOAD_EDGE_DOCUMENT": {
      return update(state, {
        info: {
          loading: {
            $set: true,
          },
        },
      });
    }
    case "INFOBOX_EDGE_TEXT": {
      if (!action.data && !state.info) return state;
      if (!action.data)
        return update(state, {
          info: {
            loading: {
              $set: false,
            },
          },
        });

      return update(state, {
        info: {
          loading: { $set: false },
          clipText: {
            $set: action.data.quoted_text
              ? action.data.quoted_text
              : state.info.clipText,
          },
          text: { $set: action.data.text ? action.data.text : state.info.text },
          title: { $set: action.data.title },
          date: { $set: action.data.date },
        },
      });
    }
    case "INFOBOX_TOP_NEIGHBOURS": {
      if (action.data.length === 0 && !state.info) return state;
      if (action.data.length === 0)
        return update(state, {
          info: {
            neighbours: {
              $set: {
                loading: false,
                members: [],
              },
            },
          },
        });

      const newState = { entities: {} };
      if (state.info)
        newState.info = {
          neighbours: {
            $set: {
              loading: false,
              members: [],
            },
          },
        };
      for (const node of action.data) {
        newState.entities[node.id] = { $set: node };
        if (newState.info)
          newState.info.neighbours["$set"].members.push({
            id: node.id,
            label: node.label,
          });
      }
      return update(state, newState);
    }
    case "CLOSE_INFO_BOX": {
      return update(state, {
        info: {
          $set: null,
        },
      });
    }
    case "EXECUTE_TOP_ENTITIES": {
      return update(state, {
        error: { $set: null },
        loading: { $set: true },
        queries: {
          [action.id]: {
            $set: {
              text: "GET TOP ENTITIES",
              started: moment().toISOString(),
              finished: null,
              entities: null,
              status: "Pending",
            },
          },
        },
        history: { $push: [action.id] },
      });
    }
    case "EXECUTE_LUCKY": {
      return update(state, {
        error: { $set: null },
        loading: { $set: true },
        queries: {
          [action.id]: {
            $set: {
              text: "I'm feeling lucky!",
              started: moment().toISOString(),
              finished: null,
              entities: null,
              status: "Pending",
            },
          },
        },
        history: { $push: [action.id] },
      });
    }
    case "EXPAND_NODE": {
      return update(state, {
        error: { $set: null },
        loading: { $set: true },
        queries: {
          [action.id]: {
            $set: {
              text: `EXPANDING ${action.entity}`,
              started: moment().toISOString(),
              finished: null,
              entities: null,
              status: "Pending",
            },
          },
        },
        history: { $push: [action.id] },
      });
    }
    case "EXECUTE_QUERY": {
      return update(state, {
        error: { $set: null },
        loading: { $set: true },
        queries: {
          [action.id]: {
            $set: {
              text: action.query,
              started: moment().toISOString(),
              finished: null,
              entities: null,
              status: "Pending",
            },
          },
        },
        history: { $push: [action.id] },
      });
    }
    case "EXPAND_QUERY_RESULT": {
      const shouldClear = state.configNextPageBehaviour === "CLEAR";

      const newState = {
        loading: { $set: false },
        queries: {
          [action.id]: {
            finished: {
              $set: moment().toISOString(),
            },
            status: {
              $set: "Success",
            },
            entities: {
              $set: action.entitiesCount || 0,
            },
          },
        },
        data: {
          nodes: (old) => {
            const cursors = new Set(Object.keys(state.cursors));
            const oldNodes = old.filter((node) => !cursors.has(node.id));

            if (!shouldClear || !action.prevCursor)
              return oldNodes.concat(action.data.nodes);

            const nodes = new Set(
              action.prevCursor.nodes.map((node) => node.id)
            );
            nodes.delete(action.prevCursor.root);

            return oldNodes
              .filter((node) => !nodes.has(node.id))
              .concat(action.data.nodes);
          },
          links: (old) => {
            const cursors = new Set(Object.keys(state.cursors));
            const oldLinks = old.filter(
              ({ source, target }) =>
                !cursors.has(source) && !cursors.has(target)
            );

            if (!shouldClear || !action.prevCursor)
              return oldLinks.concat(action.data.links);

            const links = {};
            for (const { source, target } of action.prevCursor.links) {
              if (!links[source]) links[source] = {};
              links[source][target] = true;
            }

            return oldLinks
              .filter(
                ({ source, target }) =>
                  !(links[source] && links[source][target])
              )
              .concat(action.data.links);
          },
          // nodes: { $push: action.data.nodes },
          // links: { $push: action.data.links },
        },
        cursors: {
          [action.cursor.id]: {
            $set: action.cursor,
          },
        },
      };

      if (action.data.nodes.length) {
        newState.entities = {};
        for (const node of action.data.nodes) {
          newState.entities[node.id] = { $set: node };
        }
      }

      if (action.data.links.length) {
        newState.edges = state.edges;
        for (const link of action.data.links) {
          newState.edges = update(newState.edges, {
            [link.source]: (s) =>
              update(s || {}, {
                [link.target]: (t) =>
                  update(t || {}, {
                    $set: link,
                  }),
              }),
          });
        }
        newState.edges = { $set: newState.edges };
      }

      return update(state, newState);
    }
    case "EXECUTE_QUERY_ERROR": {
      return update(state, {
        loading: { $set: false },
        queries: {
          [action.id]: {
            finished: {
              $set: moment().toISOString(),
            },
            status: {
              $set: "Error",
            },
            entities: {
              $set: action.entitiesCount || 0,
            },
          },
        },
        error: { $set: action.message },
      });
    }
    case "EXECUTE_QUERY_RESULT": {
      const newState = {
        loading: { $set: false },
        queries: {
          [action.id]: {
            finished: {
              $set: moment().toISOString(),
            },
            status: {
              $set: action.entitiesCount ? "Success" : "No Result",
            },
            entities: {
              $set: action.entitiesCount || 0,
            },
          },
        },
        data: {
          $set: action.data.nodes.length ? action.data : null,
        },
      };

      if (action.data.nodes.length) {
        newState.entities = {};
        for (const node of action.data.nodes) {
          newState.entities[node.id] = { $set: node };
        }
      }
      return update(state, newState);
    }
    case "CLEAR_QUERY_HISTORY": {
      return update(state, {
        queries: { $set: {} },
        history: { $set: [] },
      });
    }
    case "CLEAR_GRAPH": {
      return update(state, {
        data: { $set: null },
      });
    }
    case "OPEN_PROJECT": {
      return initialState;
    }
    default:
      return state;
  }
}

export default explore;
