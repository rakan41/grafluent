const axios = require("axios");
const constants = require("../constants");

module.exports = async function topEntityHandler(req, res) {
  try {
    const { project } = req.params;
    const { uid } = req.auth;
    const params = {};

    if (req.query.limit) params.result_limit = req.query.limit;
    if (req.query.type) params.entity_type = req.query.type;
    if (req.query.centrality) params.centrality_measure = req.query.centrality;

    const {
      data,
    } = await axios.get(
      `${constants.GRAPH_ENDPOINT}/query/mostCentral/${uid}/${project}/`,
      { params }
    );
    const result = JSON.parse(data);
    res.json(result);
  } catch (e) {
    console.log("Error when performing graph request", e);
    res.sendStatus(500);
  }
};
