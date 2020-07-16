const express = require("express");
const cors = require("cors");
const parser = require("body-parser");

const { loginHandler, registerHandler } = require("./handlers/auth");
const {
  getProjectHandler,
  createProjectHandler,
  uploadDocHandler,
  uploadDocStatusHandler,
  getDocsHandler,
  addAPIHandler,
} = require("./handlers/projects");
const queryHandler = require("./handlers/query");
const luckHandler = require("./handlers/luck");
const expandHandler = require("./handlers/expand");
const neighboursHandler = require("./handlers/neighbours");
const topEntityHandler = require("./handlers/top-entity");
const edgeHandler = require("./handlers/edges");
const userMiddleware = require("./middlewares/user");

const app = express();
const port = process.env.PORT || 3878;

app.use(cors());
app.use(parser.json());

app.post("/auth/login", loginHandler);
app.post("/auth", registerHandler);
app.get("/projects", userMiddleware, getProjectHandler);
app.post("/projects", userMiddleware, createProjectHandler);
app.post("/projects/:project/api/:type", userMiddleware, addAPIHandler);
app.get("/projects/:project/docs", userMiddleware, getDocsHandler);
app.put(
  "/projects/:project/docs/:name",
  userMiddleware,
  parser.raw({ type: "*/*" }),
  uploadDocHandler
);
app.get(
  "/projects/:project/docs/:name/status",
  userMiddleware,
  uploadDocStatusHandler
);
app.get("/projects/:project/entities", userMiddleware, queryHandler);
app.get("/projects/:project/luckbox", userMiddleware, luckHandler);
app.get("/projects/:project/top", userMiddleware, topEntityHandler);
app.get("/projects/:project/entities/:id", userMiddleware, expandHandler);
app.get(
  "/projects/:project/entities/:id/neighbours",
  userMiddleware,
  neighboursHandler
);
app.get("/projects/:project/edges/:id", userMiddleware, edgeHandler);

app.listen(port, () => {
  console.log("HTTP server is started on port", port);
});

// DEVELOPMENT ONLY:
const jwt = require("jsonwebtoken");
const constants = require("./constants");
console.log(jwt.sign({ uid: "test_user" }, constants.JWT_SECRET));
