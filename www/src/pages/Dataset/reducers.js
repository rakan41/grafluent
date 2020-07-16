const uuid = require("uuid");
const update = require("immutability-helper");

// close = showdown
// limit: 5

const initialState = {
  processing: false,
  loading: true,
  error: null,
  configs: {
    limit: "5",
    close: false,
    relations: false,
    corefs: false,
    pictures: true,
    summary: true,
    newgraph: true,
    documentedges: true,
  },
  documents: {},
  sources: [],
  showAPI: null,
  showDialog: false,
  showSettings: false,
};

function data(state = initialState, action) {
  switch (action.type) {
    case "UPDATE_UPLOAD_CONFIGS": {
      return update(state, {
        configs: {
          [action.key]: {
            $set: action.value,
          },
        },
      });
    }
    case "LOAD_DATASET": {
      return update(state, {
        loading: {
          $set: true,
        },
      });
    }
    case "LOAD_DATASET_SUCCESS": {
      const documents = {};
      const sources = [];
      for (const doc of action.data) {
        documents[doc.id] = {
          type: doc.type,
          name: doc.id,
        };
        sources.push(doc.id);
      }
      return update(state, {
        loading: {
          $set: false,
        },
        documents: { $set: documents },
        sources: { $set: sources },
      });
    }
    case "OPEN_ADD_DIALOG": {
      return update(state, {
        showDialog: { $set: true },
      });
    }
    case "CLOSE_ADD_DIALOG": {
      return update(state, {
        showDialog: { $set: false },
      });
    }
    case "OPEN_SETTINGS_DIALOG": {
      return update(state, {
        showDialog: { $set: false },
        showSettings: { $set: true },
      });
    }
    case "CLOSE_SETTINGS_DIALOG": {
      return update(state, {
        showDialog: { $set: true },
        showSettings: { $set: false },
      });
    }
    case "OPEN_DATASOURCE_API": {
      return update(state, {
        showDialog: { $set: false },
        showAPI: { $set: action.api },
      });
    }
    case "CLOSE_DATASOURCE_API": {
      return update(state, {
        showDialog: { $set: true },
        showAPI: { $set: null },
      });
    }
    case "ADD_DATASOURCE_API": {
      const newState = {
        showDialog: { $set: false },
        showAPI: { $set: false },
        documents: {
          [action.file]: {
            $set: {
              type: action.api,
              loading: true,
              name: action.file,
            },
          },
        },
      };
      if (!state.documents[action.file])
        newState.sources = { $unshift: [action.file] };
      return update(state, newState);
    }
    case "UPDATE_FILENAME": {
      return update(state, {
        documents: {
          $unset: [action.from],
          [action.to]: {
            $set: state.documents[action.from],
          },
        },
        sources: (oldSources) =>
          [action.to].concat(oldSources.filter((id) => id !== action.from)),
      });
    }
    case "UPLOAD_DOCUMENT": {
      const newState = {
        showDialog: { $set: false },
        documents: {
          [action.name]: {
            $set: {
              type: "PDF",
              loading: true,
              name: action.name,
            },
          },
        },
      };
      if (!state.documents[action.name])
        newState.sources = { $unshift: [action.name] };
      return update(state, newState);
    }
    case "UPLOAD_ERROR":
    case "UPLOAD_COMPLETE": {
      return update(state, {
        documents: {
          [action.name]: {
            loading: { $set: false },
          },
        },
      });
    }
    case "ADD_DATA_LOADING_START": {
      return update(state, {
        showDialog: { $set: false },
        processing: { $set: true },
      });
    }
    case "OPEN_PROJECT":
      return initialState;

    default:
      return state;
  }
}

export default data;
