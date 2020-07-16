import React from "react";
import ReactDOM from "react-dom";
import { combineReducers, createStore, applyMiddleware, compose } from "redux";
import { Provider } from "react-redux";
import createSagaMiddleware from "redux-saga";
import { all } from "redux-saga/effects";

import App from "./App";
import explore from "./pages/Explore/reducers";
import data from "./pages/Dataset/reducers";
import home from "./pages/Home/reducers";
import login from "./pages/Login/reducers";
import notification from "./components/Notification/reducers";
import app from "./appReducer";
import { exploreSaga } from "./pages/Explore/sagas";
import { dataSaga } from "./pages/Dataset/sagas";
import { loginSaga, fetchLoginInfo } from "./pages/Login/sagas";
import { homeSaga } from "./pages/Home/sagas";

String.prototype.capitalize = function () {
  return this.charAt(0).toUpperCase() + this.slice(1).toLowerCase();
};

function* rootSaga() {
  yield all([
    exploreSaga(),
    dataSaga(),
    loginSaga(),
    fetchLoginInfo(),
    homeSaga(),
  ]);
}
const sagaMiddleware = createSagaMiddleware();
const reducers = combineReducers({
  notification,
  explore,
  home,
  data,
  login,
  app,
});

const middleware = [applyMiddleware(sagaMiddleware)];
if (window.__REDUX_DEVTOOLS_EXTENSION__)
  middleware.push(window.__REDUX_DEVTOOLS_EXTENSION__());

const store = createStore(reducers, compose(...middleware));
sagaMiddleware.run(rootSaga);

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("root")
);
