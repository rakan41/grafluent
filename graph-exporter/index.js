const express = require("express");
const cors = require("cors");
const captureWebsite = require("capture-website");
const parser = require("body-parser");
const uuid = require("uuid");

const port = process.env.PORT || 3231;
const app = express();
app.use(cors());

const images = {};
const data = {
  test: {
    nodes: [
      {
        id: "Donald Trump",
        size: 750,
        image:
          "https://images.weserv.nl/?mask=circle&w=250&h=250&fit=cover&url=ssl:upload.wikimedia.org/wikipedia/commons/thumb/5/56/Donald_Trump_official_portrait.jpg/946px-Donald_Trump_official_portrait.jpg"
      },
      {
        id: "Joe Biden",
        size: 450,
        image:
          "https://images.weserv.nl/?mask=circle&w=150&h=150&fit=cover&url=ssl:upload.wikimedia.org/wikipedia/commons/a/ad/Joe_Biden_%2848548455397%29_%28rotated%29.jpg"
      },
      { id: "Hillary Clinton", kind: "PERSON" },
      { id: "Michael Jackson", size: 400, kind: "PERSON" },
      { id: "Bob Marley", kind: "PERSON" }
    ],
    links: [
      { source: "Donald Trump", target: "Joe Biden", color: "#f5ed93" },
      {
        source: "Donald Trump",
        target: "Hillary Clinton",
        color: "#f5ed93"
      },
      {
        source: "Donald Trump",
        target: "Michael Jackson",
        color: "#ff8a8a"
      },
      { source: "Donald Trump", target: "Bob Marley", color: "#8af2f1" }
    ]
  }
};

app.get("/", async (req, res) => {
  try {
    const id = uuid.v4();
    data[id] = JSON.parse(Buffer.from(req.query.data, "base64").toString());
    const bufer = await captureWebsite.buffer(
      `http://localhost:5000/?id=${id}&port=${port}`,
      {
        width: 1000,
        height: 400,
        launchOptions: {
          args: ["--no-sandbox", "--disable-setuid-sandbox"]
        }
      }
    );
    res.setHeader("content-type", "image/png");
    res.send(bufer);

    delete data[id];
  } catch (e) {
    res.sendStatus(400);
  }
});

app.post("/", parser.json(), async (req, res) => {
  try {
    const id = uuid.v4();
    data[id] = req.body;
    images[id] = await captureWebsite.buffer(
      `http://localhost:5000/?id=${id}&port=${port}`,
      {
        width: 1000,
        height: 400,
        launchOptions: {
          args: ["--no-sandbox", "--disable-setuid-sandbox"]
        }
      }
    );
    res.json({ id });
    delete data[id];
  } catch (e) {
    console.log(e);
    res.sendStatus(400);
  }
});

app.get("/images/:id", async (req, res) => {
  const id = req.params.id;
  if (!images[id]) return res.sendStatus(404);
  res.setHeader("content-type", "application/octet-stream");
  res.setHeader("content-disposition", 'attachment; filename="graph.png"');
  res.send(images[id]);
});

app.get("/data", async (req, res) => {
  res.json(data[req.query.id]);
});

app.listen(port, () => {
  console.log("HTTP server is started on port", port);
});
