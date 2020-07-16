const AWS = require("aws-sdk");
const axios = require("axios");
const qs = require("query-string");
const { EventSource } = require("launchdarkly-eventsource");

const constants = require("../constants");

const s3 = new AWS.S3({
  signatureVersion: "v4",
  accessKeyId: constants.AWS_ACCESS_KEY,
  secretAccessKey: constants.AWS_SECRET_KEY,
  region: constants.AWS_REGION,
});

async function getProjectHandler(req, res) {
  const { uid } = req.auth;
  try {
    const { data } = await axios.get(
      `${constants.GRAPH_ENDPOINT}/admin/user/project/${uid}/`
    );
    if (data.result) return res.json(data.project_list);

    res.status(400).json({ message: data.message });
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
}

async function createProjectHandler(req, res) {
  const { uid, pwd } = req.auth;
  const { name } = req.body;

  try {
    const { data } = await axios.post(
      `${constants.GRAPH_ENDPOINT}/admin/user/project/`,
      [
        {
          user_name: uid,
          password: pwd,
          project_name: name,
        },
      ]
    );
    if (data.result) return res.sendStatus(200);

    res.status(400).json({ message: data.message });
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
}

async function uploadDocStatusHandler(req, res) {
  const { uid } = req.auth;
  const { project, name } = req.params;
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  const opts = qs.stringify({
    input: `s3://${constants.AWS_S3_BUCKET}/${uid}/${project}/source_documents/${name}`,
    output: `s3://${constants.AWS_S3_BUCKET}`,
    arango: constants.NLP_CONFIG_ARANGO,
    user: uid,
    project: project,
    limit: req.query.limit || "5",
    close: req.query.close || "false",
    relations: req.query.relations || "true",
    corefs: req.query.corefs || "true",
    pictures: req.query.pictures || "true",
    summary: req.query.summary || "true",
    newgraph: req.query.newgraph || "true",
    documentedges: req.query.documentedges || "true",
    memory: "8g",
    debug: "true",
  });
  console.log(`${constants.NLP_ENDPOINT}/run?${opts}`);
  const es = new EventSource(`${constants.NLP_ENDPOINT}/run?${opts}`, {
    method: "POST",
    initialRetryDelayMillis: 60 * 1000,
  });
  es.onmessage = (e) => {
    console.log("EventSource", e);
    res.write(`data: ${e.data}\n\n`);
  };
  es.onerror = (e) => {
    console.log("EventSource Error", e);
    es.close();
    res.end("ERROR");
  };

  // let progress = 0;
  // const tes = setInterval(() => {
  //   console.log("sending", `data: ${progress}\n\n`);
  //   res.write(`data: ${progress}\n\n`);
  //   if (progress === 50) {
  //     res.end("ERROR");
  //     clearInterval(tes);
  //     return;
  //   }
  //   progress += 10;
  // }, 1000);

  req.on("close", () => {
    console.log("Conn closed!");
    try {
      es.close();
    } catch (e) {}
  });
}

async function uploadDocHandler(req, res) {
  const { uid } = req.auth;
  const { project, name } = req.params;

  const key = `${uid}/${project}/source_documents/${name}`;
  const params = {
    Bucket: constants.AWS_S3_BUCKET,
    Key: key,
    ACL: "public-read",
    Body: req.body,
  };

  try {
    const result = await new Promise((res, rej) =>
      s3.upload(params, (err, data) => {
        if (err) return rej(err);
        res(data);
      })
    );
    res.send({ result });
  } catch (e) {
    res.status(500).send({ message: "Upload to S3 Failed!" });
  }
}

function convertDataAPIType(type) {
  switch (type) {
    case "Twitter":
      return "twitter";
    case "News":
      return "news";
    case "Wikipedia":
      return "wiki";
  }
}

async function addAPIHandler(req, res) {
  const { uid } = req.auth;
  const { project, type } = req.params;
  const { keyword } = req.body;
  const api_type = convertDataAPIType(type);

  try {
    console.log(`${constants.DATA_API_ENDPOINT}/${api_type}/${uid}/${project}`);
    const { data } = await axios.post(
      `${constants.DATA_API_ENDPOINT}/${api_type}/${uid}/${project}/`,
      null,
      {
        params: {
          query: keyword,
          num_req: "20",
        },
      }
    );
    console.log(data);
    res.json({ file: `${api_type}_${data.file_name}` });
  } catch (e) {
    if (
      e.response &&
      e.response.data &&
      (e.response.data.failed || e.response.data.status)
    ) {
      return res
        .status(400)
        .json({ message: e.response.data.failed || e.response.data.status });
    }
    console.log(e);
    res.sendStatus(500);
  }
}

function getDocType(fileName) {
  if (fileName.startsWith("twitter_")) return "Twitter";
  if (fileName.startsWith("news_")) return "News";
  if (fileName.startsWith("wiki_")) return "Wikipedia";
  return "PDF";
}

async function getDocsHandler(req, res) {
  const { uid } = req.auth;
  const { project } = req.params;

  const path = `${uid}/${project}/source_documents/`;
  const params = {
    Bucket: constants.AWS_S3_BUCKET,
    Delimiter: "/",
    Prefix: path,
  };

  try {
    const result = await new Promise((res, rej) =>
      s3.listObjectsV2(params, (err, data) => {
        if (err) return rej(err);
        res(data);
      })
    );
    res.send(
      result.Contents.map(({ Key }) => ({
        id: Key.replace(path, ""),
        name: Key.replace(path, ""),
        type: getDocType(Key.replace(path, "")),
      })).filter(({ id }) => id !== "touch")
    );
  } catch (e) {
    res.status(500).send({ message: "Unable to list file" });
  }
}

module.exports = {
  getProjectHandler,
  createProjectHandler,
  uploadDocHandler,
  uploadDocStatusHandler,
  addAPIHandler,
  getDocsHandler,
};
