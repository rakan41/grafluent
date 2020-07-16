function processImageUrl(url) {
  if (!url) return null;
  if (url.startsWith("//")) return url.substring(2);
  return url.split("://")[1];
}

function mapVerticesWithLocation({ _key, label, type, image_url, summary }) {
  return {
    id: _key,
    kind: type,
    labelProperty: "label",
    label,
    image: processImageUrl(image_url),
    summary: summary || null,
    x: Math.floor(Math.random() * 900) + 50,
    y: Math.floor(Math.random() * 300) + 50,
  };
}

function mapVertices({ _key, label, type, image_url, summary }) {
  return {
    id: _key,
    kind: type,
    labelProperty: "label",
    label,
    image: processImageUrl(image_url),
    summary: summary || null,
  };
}

function mapEdges({
  _key,
  _from,
  _to,
  source_file,
  from_char_offset,
  to_char_offset,
  semantic_type,
  type,
}) {
  const [_0, from] = _from.split("/");
  const [_1, to] = _to.split("/");
  return {
    key: _key,
    source: from,
    target: to,
    file: source_file,
    kind: type,
    offset: {
      from: from_char_offset[0],
      to: to_char_offset[1],
    },
    semanticType: semantic_type,
  };
}

export { mapEdges, mapVertices, mapVerticesWithLocation };
