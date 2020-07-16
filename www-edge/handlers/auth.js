const axios = require("axios");
const constants = require("../constants");
const jwt = require("jsonwebtoken");

async function loginHandler(req, res) {
  const { username, password } = req.body;
  try {
    const { data } = await axios.post(
      `${constants.GRAPH_ENDPOINT}/admin/user/login/`,
      [
        {
          user_name: username,
          password,
        },
      ]
    );
    if (data.result)
      return res.json({
        token: jwt.sign({ uid: username, pwd: password }, constants.JWT_SECRET),
      });

    res.status(400).json({ message: data.message });
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
}

async function registerHandler(req, res) {
  const { username, password, email } = req.body;
  try {
    const { data } = await axios.post(
      `${constants.GRAPH_ENDPOINT}/admin/user/`,
      [
        {
          user_name: username,
          account_type: "GENERIC",
          password: password,
          email: email || "",
        },
      ]
    );
    if (data.user_name)
      return res.json({
        token: jwt.sign({ uid: username, pwd: password }, constants.JWT_SECRET),
      });

    res.status(400).json({ message: data.message });
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
}

module.exports = { loginHandler, registerHandler };
