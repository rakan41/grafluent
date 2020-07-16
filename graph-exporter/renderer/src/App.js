import React from "react";
import { Graph } from "react-d3-graph";
import Node from "./Node";
import axios from "axios";
import { theme } from "./mui";
import { ThemeProvider } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import qs from "query-string";

const graphConfig = {
  highlightDegree: 2,
  highlightOpacity: 0.2,
  linkHighlightBehavior: true,
  nodeHighlightBehavior: true,
  width: 1000,
  d3: {
    alphaTarget: 0.05,
    gravity: -250,
    linkLength: 120,
    linkStrength: 2
  },
  node: {
    labelProperty: "label",
    color: "lightgreen",
    size: 400,
    fontSize: 10,
    fontWeight: "normal",
    highlightFontSize: 14,
    highlightFontWeight: "bold",
    highlightStrokeColor: "red",
    highlightStrokeWidth: 1.5,
    viewGenerator: entity => <Node entity={entity} />
  },
  link: {
    highlightColor: "lightblue",
    strokeWidth: 5
  }
};

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      data: null
    };
  }

  componentDidMount() {
    const query = qs.parse(window.location.search);
    const port = query.port || 3231;
    axios
      .get(`http://localhost:${port}/data${window.location.search}`)
      .then(data => data.data)
      .then(data => {
        this.setState({ data });
      });
  }

  render() {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="App">
          {this.state.data ? (
            <Graph
              id="explore-graph"
              data={this.state.data}
              config={graphConfig}
            />
          ) : (
            <h1>Something went wrong. Please try again.</h1>
          )}
        </div>
      </ThemeProvider>
    );
  }
}

export default App;
