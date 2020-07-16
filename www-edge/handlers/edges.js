const axios = require("axios");
const constants = require("../constants");

module.exports = async function edgeHandler(req, res) {
  try {
    const { project, id } = req.params;
    const { uid } = req.auth;
    const full = !!req.query.full;
    const { data } = await axios.get(
      `${constants.GRAPH_ENDPOINT}/query/text/${uid}/${project}/${req.query.type}/${id}/`,
      {
        params: full ? { full_text: "true" } : {},
      }
    );
    res.json(data.document);
  } catch (e) {
    console.log("Error when performing edge request", e);
    res.sendStatus(500);
  }
};
