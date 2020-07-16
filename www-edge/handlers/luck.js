const axios = require("axios");
const constants = require("../constants");

module.exports = async function queryHandler(req, res) {
  try {
    const { project } = req.params;
    const { uid } = req.auth;
    const params = {};

    if (req.query.limit) params.result_limit = req.query.limit;
    if (req.query.type) params.entity_type = req.query.type;

    const {
      data,
    } = await axios.get(
      `${constants.GRAPH_ENDPOINT}/query/feelingLucky/${uid}/${project}/`,
      { params }
    );
    const result = JSON.parse(data);
    res.json(result);
  } catch (e) {
    console.log("Error when performing graph request", e);
    res.sendStatus(500);
  }
};
