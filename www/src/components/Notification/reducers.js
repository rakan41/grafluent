const update = require("immutability-helper");
const uuid = require("uuid");

const initialState = {
  show: false,
  newNotif: false,
  notifs: [],
  uploads: {},
};

function notification(state = initialState, action) {
  switch (action.type) {
    case "UPLOAD_DOCUMENT": {
      return update(state, {
        show: {
          $set: true,
        },
        uploads: {
          [action.name]: {
            $set: {
              name: action.name,
              type: "PDF",
              progress: 0,
              status: "S3",
            },
          },
        },
      });
    }
    case "ADD_DATASOURCE_API": {
      return update(state, {
        show: {
          $set: true,
        },
        uploads: {
          [action.file]: {
            $set: {
              name: action.file,
              type: action.api,
              progress: 0,
              status: "S3",
            },
          },
        },
      });
    }
    case "UPDATE_FILENAME": {
      return update(state, {
        uploads: {
          $unset: [action.from],
          [action.to]: {
            $set: state.uploads[action.from],
          },
        },
      });
    }
    case "UPLOAD_PROCESSING": {
      return update(state, {
        uploads: {
          [action.name]: {
            status: { $set: "processing" },
          },
        },
      });
    }
    case "UPLOAD_PROGRESS": {
      return update(state, {
        uploads: {
          [action.name]: {
            progress: { $set: action.progress },
          },
        },
      });
    }
    case "UPLOAD_COMPLETE": {
      return update(state, {
        notifs: {
          $unshift: [
            {
              id: uuid.v4(),
              project: action.project,
              name: action.name,
              type: state.uploads[action.name].type,
            },
          ],
        },
        uploads: {
          $unset: [action.name],
        },
        newNotif: {
          $set: true,
        },
      });
    }
    case "UPLOAD_ERROR": {
      return update(state, {
        notifs: {
          $unshift: [
            {
              id: uuid.v4(),
              project: action.project,
              name: action.name,
              error: action.message,
              type: state.uploads[action.name].type,
            },
          ],
        },
        uploads: {
          $unset: [action.name],
        },
        newNotif: {
          $set: true,
        },
      });
    }
    case "CLOSE_NOTIFICATION": {
      return update(state, {
        show: {
          $set: false,
        },
        newNotif: {
          $set: false,
        },
      });
    }
    case "OPEN_NOTIFICATION": {
      return update(state, {
        show: {
          $set: true,
        },
      });
    }
    default:
      return state;
  }
}

export default notification;
