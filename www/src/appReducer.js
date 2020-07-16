const update = require("immutability-helper");

const initialState = {
  auth: null,
  username: null,
};

function app(state = initialState, action) {
  switch (action.type) {
    case "LOGIN_SUCCESS":
      return update(state, {
        auth: { $set: action.token },
        username: { $set: action.username },
      });
    default:
      return state;
  }
}

export default app;
