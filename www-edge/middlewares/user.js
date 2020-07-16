const jwt = require("jsonwebtoken");
const constants = require("../constants");

module.exports = async function userMiddleware(req, res, next) {
  if (!req.headers["authorization"] && !req.query.auth)
    return res.sendStatus(401);
  try {
    const token = req.query.auth || req.headers["authorization"].split(" ")[1];
    const decoded = jwt.verify(token, constants.JWT_SECRET);
    req.auth = decoded;
    next();
  } catch (e) {
    res.status(401).send({ message: "invalid token" });
  }
};
