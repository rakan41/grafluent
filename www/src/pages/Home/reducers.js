const uuid = require("uuid");
const update = require("immutability-helper");

const initialState = {
  runHelp: false,
  loading: false,
  createLoading: false,
  error: null,
  projects: [],
};

function home(state = initialState, action) {
  switch (action.type) {
    case "CREATE_PROJECT": {
      return update(state, {
        createLoading: {
          $set: true,
        },
        error: {
          $set: null,
        },
      });
    }
    case "LOAD_PROJECTS": {
      return update(state, {
        loading: {
          $set: true,
        },
        error: {
          $set: null,
        },
      });
    }
    case "CREATE_PROJECT_SUCCESS": {
      return update(state, {
        createLoading: {
          $set: false,
        },
        projects: {
          $unshift: [{ id: action.id, name: action.id }],
        },
      });
    }
    case "LOAD_PROJECTS_SUCCESS": {
      return update(state, {
        loading: {
          $set: false,
        },
        projects: {
          $set: action.data.map((id) => ({ id, name: id })),
        },
      });
    }
    case "CREATE_PROJECT_ERROR":
    case "LOAD_PROJECTS_ERROR": {
      return update(state, {
        createLoading: {
          $set: false,
        },
        loading: {
          $set: false,
        },
        error: {
          $set: action.message,
        },
      });
    }
    case "START_HOME_HELP": {
      return update(state, {
        runHelp: {
          $set: true,
        },
      });
    }
    case "STOP_HOME_HELP": {
      return update(state, {
        runHelp: {
          $set: false,
        },
      });
    }
    default:
      return state;
  }
}

export default home;
