const axios = require("axios");
const constants = require("../constants");

module.exports = async function expandHandler(req, res) {
  try {
    const { project, id } = req.params;
    const { uid } = req.auth;
    const params = {
      vertex_key: id,
    };

    if (req.query.limit) params.result_limit = req.query.limit;
    if (req.query.offset) params.offset = req.query.offset;
    if (req.query.depth) params.depth = req.query.depth;
    if (req.query.relationshipType)
      params.relationship_type = req.query.relationshipType;
    if (req.query.entityType) params.entity_type = req.query.entityType;

    const {
      data,
    } = await axios.get(
      `${constants.GRAPH_ENDPOINT}/query/expand/${uid}/${project}/`,
      { params }
    );
    const result = JSON.parse(data);
    res.json(result);
  } catch (e) {
    console.log("Error when performing graph request", e);
    res.sendStatus(500);
  }
};
