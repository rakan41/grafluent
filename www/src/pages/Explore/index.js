import React from "react";
import { connect } from "react-redux";
import { Graph } from "react-d3-graph";
import Alert from "@material-ui/lab/Alert";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import LinearProgress from "@material-ui/core/LinearProgress";
import CircularProgress from "@material-ui/core/CircularProgress";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import TextField from "@material-ui/core/TextField";
import { withStyles } from "@material-ui/core/styles";

import Skeleton from "react-loading-skeleton";
import HighlightOffIcon from "@material-ui/icons/HighlightOff";
import GetAppIcon from "@material-ui/icons/GetApp";
import FileCopyIcon from "@material-ui/icons/FileCopy";
import TwitterIcon from "@material-ui/icons/Twitter";
import DescriptionIcon from "@material-ui/icons/Description";
import CodeIcon from "@material-ui/icons/Code";
import SearchIcon from "@material-ui/icons/Search";
import SettingsIcon from "@material-ui/icons/Settings";
import EmojiEventsIcon from "@material-ui/icons/EmojiEvents";
import HomeIcon from "@material-ui/icons/Home";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";

import ButtonGroup from "@material-ui/core/ButtonGroup";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";

import Breadcrumbs from "@material-ui/core/Breadcrumbs";
import TableContainer from "@material-ui/core/TableContainer";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
import Chip from "@material-ui/core/Chip";
import Link from "@material-ui/core/Link";
import Avatar from "@material-ui/core/Avatar";

import Popper from "@material-ui/core/Popper";
import MenuList from "@material-ui/core/MenuList";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import Grow from "@material-ui/core/Grow";

import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

import HelpIcon from "@material-ui/icons/HelpOutline";
import FormatListNumberedIcon from "@material-ui/icons/FormatListNumbered";
import CategoryIcon from "@material-ui/icons/Category";
import DeviceHubIcon from "@material-ui/icons/DeviceHub";
import AccountTreeIcon from "@material-ui/icons/AccountTree";

import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import ListItemText from "@material-ui/core/ListItemText";
import ListSubheader from "@material-ui/core/ListSubheader";
import Switch from "@material-ui/core/Switch";
import WifiIcon from "@material-ui/icons/Wifi";
import BluetoothIcon from "@material-ui/icons/Bluetooth";

import moment from "moment";

import Node from "./Node";

const uuid = require("uuid");
const styles = (theme) => ({
  breadcrumbLink: {
    display: "flex",
  },
  breadcrumbIcon: {
    marginRight: theme.spacing(0.5),
    width: 20,
    height: 20,
  },
  loadingBlock: {
    padding: "20px",
  },
  loadingText: {
    marginTop: "8px",
  },
  zoomImageContainer: {
    position: "absolute",
    top: "0",
    left: "0",
    bottom: "0",
    right: "0",
    background: "#000",
    opacity: "0.35",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  zoomImage: {
    width: "120px",
    height: "120px",
  },
  graphLoading: {
    position: "absolute",
    top: "0",
    left: "0",
    bottom: "0",
    right: "0",
    background: "#000",
    opacity: "0.55",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  infoReadMoreImage: {
    float: "left",
    width: "150px",
    height: "200px",
    marginRight: "10px",
    marginBottom: "3px",
  },
  infoBox: {
    position: "relative",
    padding: "20px",
    height: "570px",
  },
  infoBoxClose: {
    position: "absolute",
    right: "10px",
    top: "10px",
  },
  paper: {
    position: "relative",
    margin: "auto",
    overflow: "hidden",
    marginBottom: "30px",
    minHeight: "155px",
  },
  searchBar: {
    borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
    zIndex: 400,
  },
  searchInput: {
    fontFamily: "courier",
    fontSize: theme.typography.fontSize,
    marginTop: "10px",
    marginBottom: "10px",
  },
  block: {
    display: "block",
  },
  contentWrapper: {
    margin: "40px 16px",
  },
  table: {
    marginTop: 0,
    marginBottom: 0,
  },
  main: {
    flex: 1,
    padding: theme.spacing(6, 4),
    background: "#eaeff1",
  },
  loading: {
    marginTop: "0px",
    position: "sticky",
    top: "48px",
    zIndex: 999,
  },
  loadingContent: {
    position: "absolute",
    top: "0",
    left: "0",
    right: "0",
  },
  configs: {
    width: "450px",
  },
  configHelpIcon: {
    paddingTop: "10px",
    marginLeft: "4px",
  },
});

const graphConfig = {
  highlightDegree: 2,
  highlightOpacity: 0.2,
  linkHighlightBehavior: true,
  nodeHighlightBehavior: true,
  width: 1200,
  height: 570,
  d3: {
    alphaTarget: 0.05,
    gravity: -250,
    linkLength: 120,
    linkStrength: 2,
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
    //renderLabel: false,
    viewGenerator: (entity) => <Node entity={entity} />,
  },
  link: {
    highlightColor: "lightblue",
    strokeWidth: 5,
  },
};

function highlightText(input, { from, to }) {
  const stack = [];

  let prev = 0;
  const text = input + "\n";
  const end = Math.min(to, text.length - 1);
  for (let i = 0; i < text.length; i += 1) {
    const c = text[i];

    if (i === from) {
      stack.push(<span key={prev}>{text.substring(prev, i)}</span>);
      console.log(text.substring(prev, i));
      stack.push("BEGIN");
      prev = i;
    } else if (i === end) {
      stack.push(<span key={prev}>{text.substring(prev, i)}</span>);
      const highlight = stack.splice(stack.indexOf("BEGIN")).splice(1);
      stack.push(
        <span key={prev} style={{ fontWeight: 700 }}>
          {highlight}
        </span>
      );
      prev = i;
    } else if (c === "\n") {
      stack.push(
        <span key={prev}>
          {text.substring(prev, i)}
          <br />
          <br />
        </span>
      );
      prev = i;
    }
  }
  return stack;
}

class Explore extends React.Component {
  constructor() {
    super();
    this.state = {
      showMenu: null,
      showConfigs: false,
      queryText: "",
    };
    this.mouseX = null;
    this.mouseY = null;
    this.onGraphLinkClicked = this.onGraphLinkClicked.bind(this);
    this.onGraphNodeClicked = this.onGraphNodeClicked.bind(this);
    this.handleMenuClose = this.handleMenuClose.bind(this);
    this.handleExpand = this.handleExpand.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (
      this.graphContainer &&
      prevProps.loading &&
      !this.props.loading &&
      !this.props.error
    ) {
      const element = this.graphContainer;
      const y = element.getBoundingClientRect().top + window.pageYOffset - 60;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
    if (
      this.errorRef &&
      prevProps.loading &&
      !this.props.loading &&
      this.props.error
    ) {
      const element = this.errorRef;
      const y = element.getBoundingClientRect().top + window.pageYOffset - 90;
      window.scrollTo({ top: y, behavior: "smooth" });
    }

    if (
      this.props.history.length > prevProps.history.length &&
      this.historyContainerRef
    ) {
      this.historyContainerRef.scrollTop = this.historyContainerRef.scrollHeight;
    }
  }

  onGraphLinkClicked(source, dest) {
    if (this.props.cursors[source] || this.props.cursors[dest]) {
      return;
    }

    const { id: project } = this.props.match.params;
    this.props.dispatch({
      type: "OPEN_INFO_BOX",
      kind: "RELATIONSHIP",
      project,
      source,
      dest,
    });
  }

  onGraphNodeClicked(id) {
    if (this.props.cursors[id]) {
      const { id: project } = this.props.match.params;
      this.props.dispatch({
        type: "EXPAND_NODE",
        id: uuid.v4(),
        cursorId: id,
        entity: this.props.cursors[id].root,
        project,
      });
      return;
    }
    switch (id) {
      case "Rivals":
        this.props.dispatch({
          type: "EXECUTE_QUERY",
          id: uuid.v4(),
          query: "Donald Trump's TOP 5 Rivals",
        });
        break;
      case "Places":
        this.props.dispatch({
          type: "EXECUTE_QUERY",
          id: uuid.v4(),
          query: "Donald Trump's TOP 5 Rivals",
        });
        break;
      default:
        this.setState({ showMenu: id });
    }
  }

  handleMenuClose() {
    this.setState({ showMenu: null });
  }

  handleMenuGetInfo(id) {
    const { id: project } = this.props.match.params;
    this.props.dispatch({
      type: "OPEN_INFO_BOX",
      kind: "ENTITY",
      project,
      id,
    });
    this.setState({ showMenu: null });
  }

  handleExpand(entity) {
    const { id: project } = this.props.match.params;
    this.props.dispatch({
      type: "EXPAND_NODE",
      id: uuid.v4(),
      entity,
      project,
    });
    this.setState({ showMenu: null });
  }

  handleQuery() {
    if (this.state.queryText) {
      const { id: project } = this.props.match.params;
      this.props.dispatch({
        type: "EXECUTE_QUERY",
        id: uuid.v4(),
        query: this.state.queryText,
        project,
      });
      this.setState({ queryText: "" });
    }
  }

  updateConfig(config, value) {
    if (config === "entity")
      this.props.dispatch({ type: "UPDATE_CONFIG_ENTITY", value });

    if (config === "limit")
      this.props.dispatch({ type: "UPDATE_CONFIG_LIMIT", value });

    if (config === "depth")
      this.props.dispatch({ type: "UPDATE_CONFIG_DEPTH", value });

    if (config === "relationship")
      this.props.dispatch({ type: "UPDATE_CONFIG_RELATIONSHIP", value });

    if (config === "expandlimit")
      this.props.dispatch({ type: "UPDATE_CONFIG_EXPAND_LIMIT", value });

    if (config === "nextpage")
      this.props.dispatch({ type: "UPDATE_CONFIG_NEXT_PAGE", value });

    this.setState({
      showNextPageConfigMenu: false,
      showEntityMenu: false,
      showLimitMenu: false,
      showDepthMenu: false,
      showRelationshipMenu: false,
      showExpandLimitMenu: false,
    });
  }

  render() {
    const {
      configNextPageBehaviour,
      configRelationship,
      configDepth,
      configExpandResultLimit,
      configEntityType,
      configResultLimit,
      classes,
      loading,
      dispatch,
      data,
      history,
      queries,
      info,
      error,
      match,
    } = this.props;
    const { id: project } = match.params;

    return (
      <>
        {loading ? (
          <div className={classes.loading}>
            <LinearProgress className={classes.loadingContent} />
          </div>
        ) : null}
        <main className={classes.main}>
          {!data && error ? (
            <Alert severity="error" style={{ marginBottom: "10px" }}>
              {error}
            </Alert>
          ) : null}
          <Paper className={classes.paper}>
            <AppBar
              className={classes.searchBar}
              position="static"
              color="default"
              elevation={0}
            >
              <Toolbar>
                <Grid container spacing={1} alignItems="center">
                  <Grid item>
                    <SearchIcon className={classes.block} color="inherit" />
                  </Grid>
                  <Grid item xs>
                    <TextField
                      className="help-explore-inputtext"
                      disabled={loading}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") this.handleQuery();
                      }}
                      autoFocus
                      fullWidth
                      placeholder="Enter search query here ..."
                      value={this.state.queryText}
                      onChange={(e) =>
                        this.setState({ queryText: e.target.value })
                      }
                      InputProps={{
                        disableUnderline: true,
                        className: classes.searchInput,
                      }}
                    />
                  </Grid>
                  <Grid item>
                    <Tooltip title="Configurations">
                      <IconButton
                        className="help-explore-config-button"
                        disabled={loading}
                        ref={(ref) => (this.btnConfigRef = ref)}
                        onClick={() => {
                          this.setState({ showConfigs: true });
                        }}
                      >
                        <SettingsIcon />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                  <Grid item>
                    <ButtonGroup
                      className="help-explore-search-button"
                      variant="contained"
                      color="primary"
                      ref={(ref) => (this.buttonGroupRef = ref)}
                    >
                      <Button
                        disabled={loading}
                        onClick={() => this.handleQuery()}
                      >
                        Search
                      </Button>
                      <Button
                        color="primary"
                        style={{ padding: "5px", minWidth: "0px" }}
                        onClick={() => this.setState({ showSearchMenu: true })}
                      >
                        <ArrowDropDownIcon />
                      </Button>
                    </ButtonGroup>
                  </Grid>
                </Grid>
              </Toolbar>
            </AppBar>
            {history.length > 0 ? (
              <TableContainer
                ref={(ref) => (this.historyContainerRef = ref)}
                style={{ height: "200px" }}
              >
                <Table className={classes.table} stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Query</TableCell>
                      <TableCell align="right">Execution Time</TableCell>
                      <TableCell align="center"># Entities</TableCell>
                      <TableCell align="center">Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {history.map((qid) => {
                      const query = queries[qid];
                      return (
                        <TableRow key={qid}>
                          <TableCell scope="row">{query.text}</TableCell>
                          <TableCell align="right" width={200}>
                            {query.started && query.finished
                              ? `${
                                  moment(query.finished).diff(query.started) /
                                  1000
                                }s`
                              : null}
                          </TableCell>
                          <TableCell align="center" width={100}>
                            {query.entities}
                          </TableCell>
                          <TableCell align="right" width={100}>
                            {query.status === "Pending" ||
                            query.status === "No Result" ? (
                              <Chip
                                size="small"
                                color="secondary"
                                label={query.status}
                              />
                            ) : null}
                            {query.status === "Success" ? (
                              <Chip
                                size="small"
                                color="primary"
                                label="Success"
                              />
                            ) : null}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : null}
            {history.length === 0 ? (
              <div className={classes.contentWrapper}>
                <Typography color="textSecondary" align="center">
                  Query history is empty
                </Typography>
              </div>
            ) : null}
          </Paper>
          {data && error ? (
            <Alert ref={(ref) => (this.errorRef = ref)} severity="error">
              {error}
            </Alert>
          ) : null}
          {data ? (
            <Grid container spacing={2}>
              <Grid item xs={info ? 9 : 12}>
                <Paper
                  className={`${classes.paper} help-explore-graph`}
                  ref={(ref) => (this.graphContainer = ref)}
                  onMouseMove={(e) => {
                    this.mouseX = e.clientX;
                    this.mouseY = e.clientY;
                  }}
                >
                  <Graph
                    id="explore-graph"
                    data={data}
                    config={graphConfig}
                    onClickNode={this.onGraphNodeClicked}
                    onClickLink={this.onGraphLinkClicked}
                  />
                  {loading ? (
                    <div className={classes.graphLoading}>
                      <CircularProgress color="secondary" />
                    </div>
                  ) : null}
                </Paper>
              </Grid>
              {info ? (
                <Grid item xs={3}>
                  <Paper className={classes.infoBox}>
                    <Tooltip title="Close">
                      <IconButton
                        className={classes.infoBoxClose}
                        onClick={() => {
                          this.props.dispatch({ type: "CLOSE_INFO_BOX" });
                        }}
                      >
                        <HighlightOffIcon />
                      </IconButton>
                    </Tooltip>
                    {info && info.kind === "RELATIONSHIP" ? (
                      <>
                        <Typography
                          className={classes.title}
                          color="textSecondary"
                          gutterBottom
                        >
                          Relationship
                        </Typography>
                        {info.semanticType ? (
                          <>
                            <Typography variant="h5" component="h2">
                              {info.semanticType.capitalize()}
                            </Typography>
                            <br />
                            <Typography variant="body2" component="p">
                              Relationship between{" "}
                              <strong>{info.sourceName}</strong> and{" "}
                              <strong>{info.destName}</strong>.
                              <br />
                            </Typography>
                          </>
                        ) : (
                          <Typography variant="body2" component="p">
                            <strong>{info.sourceName}</strong> has a known{" "}
                            relationship with <strong>{info.destName}</strong>.
                            <br />
                          </Typography>
                        )}

                        <br />
                        {/* {info.semanticType ? (
                          <>
                          <Typography color="textSecondary">
                              Semantic Type
                            </Typography>
                            <Typography variant="body2" component="p">
                          <strong>{info.sourceName}</strong> has a known{" "}
                          relationship with <strong>{info.destName}</strong>.
                          <br />
                        </Typography>
                          </>
                        ) : null} */}
                        {info.file ? (
                          <>
                            <Typography color="textSecondary">
                              Source
                            </Typography>
                            {info.loading ? (
                              <>
                                <div style={{ width: "70px" }}>
                                  <Skeleton />
                                </div>
                                <br />
                                <div style={{ width: "170px" }}>
                                  <Skeleton />
                                </div>
                                <div style={{ width: "200px" }}>
                                  <Skeleton />
                                </div>
                                <div style={{ width: "170px" }}>
                                  <Skeleton />
                                </div>
                                <div style={{ width: "200px" }}>
                                  <Skeleton />
                                </div>
                                <div style={{ width: "170px" }}>
                                  <Skeleton />
                                </div>
                                <div style={{ width: "200px" }}>
                                  <Skeleton />
                                </div>
                                <div style={{ width: "170px" }}>
                                  <Skeleton />
                                </div>
                              </>
                            ) : null}
                            {!info.loading ? (
                              <div
                                style={{ display: "flex", marginBottom: "5px" }}
                              >
                                <DescriptionIcon
                                  fontSize="small"
                                  style={{ marginRight: "5px" }}
                                />
                                <Link
                                  onClick={() => {
                                    this.setState({ infoReadMore: true });
                                    dispatch({
                                      type: "LOAD_EDGE_DOCUMENT",
                                      project,
                                      source: info.source,
                                      dest: info.dest,
                                    });
                                  }}
                                >
                                  {info.file}
                                </Link>
                              </div>
                            ) : null}
                            {info.clipText ? (
                              <Typography variant="body2" component="p">
                                <br />
                                {info.clipText.substring(0, 400).trim() + "..."}
                                <Link
                                  onClick={() => {
                                    this.setState({ infoReadMore: true });
                                    dispatch({
                                      type: "LOAD_EDGE_DOCUMENT",
                                      project,
                                      source: info.source,
                                      dest: info.dest,
                                    });
                                  }}
                                >
                                  Read More
                                </Link>
                              </Typography>
                            ) : null}
                          </>
                        ) : null}
                      </>
                    ) : null}
                    {info && info.kind === "ENTITY" ? (
                      <>
                        <Typography
                          className={classes.title}
                          color="textSecondary"
                          gutterBottom
                        >
                          {info.type} &bull; Entity
                        </Typography>
                        <div style={{ display: "flex" }}>
                          {info.image ? (
                            <Avatar
                              style={{ marginRight: "7px" }}
                              src={`https://images.weserv.nl/?mask=circle&w=250&h=250&fit=cover&url=ssl:${info.image}`}
                            />
                          ) : null}
                          <Typography variant="h5" component="h2">
                            {info.name}
                          </Typography>
                        </div>
                        {info.summary ? (
                          <Typography variant="body2" component="p">
                            <br />
                            {info.summary.substring(0, 300).trim() + "..."}
                            <Link
                              onClick={() =>
                                this.setState({ infoReadMore: true })
                              }
                            >
                              Read More
                            </Link>
                          </Typography>
                        ) : null}
                        <br />
                        <Typography color="textSecondary">
                          Top Neighbours
                        </Typography>
                        {info.neighbours.loading ? (
                          <>
                            <div style={{ width: "70px" }}>
                              <Skeleton />
                            </div>
                            <div style={{ width: "100px" }}>
                              <Skeleton />
                            </div>
                            <div style={{ width: "70px" }}>
                              <Skeleton />
                            </div>
                            <div style={{ width: "100px" }}>
                              <Skeleton />
                            </div>
                            <div style={{ width: "70px" }}>
                              <Skeleton />
                            </div>
                          </>
                        ) : null}
                        {!info.neighbours.loading
                          ? info.neighbours.members.map((neighbour) => (
                              <div key={neighbour.id}>
                                <Link
                                  onClick={() => {
                                    this.props.dispatch({
                                      type: "OPEN_INFO_BOX",
                                      kind: "ENTITY",
                                      id: neighbour.id,
                                      project,
                                    });
                                  }}
                                >
                                  {neighbour.label}
                                </Link>
                              </div>
                            ))
                          : null}
                        {/* <br />
                        <Typography color="textSecondary">
                          Mentioned In
                        </Typography>
                        <div style={{ display: "flex", marginBottom: "5px" }}>
                          <TwitterIcon
                            fontSize="small"
                            style={{ marginRight: "5px" }}
                          />
                          <div>Twitter</div>
                        </div>
                        <div style={{ display: "flex", marginBottom: "5px" }}>
                          <CodeIcon
                            fontSize="small"
                            style={{ marginRight: "5px" }}
                          />
                          <Link href="https://newyorktimes.com" target="_blank">
                            NewYorkTimes Article
                          </Link>
                        </div>
                        <div style={{ display: "flex" }}>
                          <DescriptionIcon
                            fontSize="small"
                            style={{ marginRight: "5px" }}
                          />
                          <div>trump.pdf (Uploaded File)</div>
                        </div> */}
                      </>
                    ) : null}
                  </Paper>
                </Grid>
              ) : null}
            </Grid>
          ) : null}
        </main>
        <Menu
          keepMounted
          open={this.mouseX !== null && !!this.state.showMenu}
          onClose={this.handleMenuClose}
          anchorReference="anchorPosition"
          anchorPosition={
            this.state.showMenu
              ? { top: this.mouseY - 4, left: this.mouseX - 2 }
              : undefined
          }
        >
          <MenuItem onClick={() => this.handleMenuGetInfo(this.state.showMenu)}>
            Get Info
          </MenuItem>
          <MenuItem onClick={() => this.handleExpand(this.state.showMenu)}>
            Expand
          </MenuItem>
        </Menu>
        <Menu
          anchorEl={this.btnConfigRef}
          open={this.state.showConfigs}
          onClose={() => {
            this.setState({ showConfigs: false });
          }}
        >
          <List
            className={classes.configs}
            subheader={
              <ListSubheader>
                Searching
                <Tooltip
                  title={
                    <>
                      <Typography color="inherit">
                        Searching Configurations
                      </Typography>
                      <b>
                        <u>Entity Type</u>
                      </b>{" "}
                      : the type of entity being returned from the searching
                      process.
                      <br />
                      <br />
                      <b>
                        <u>Result Limit</u>
                      </b>{" "}
                      : the maximum number of entities returned from the
                      searching process.
                    </>
                  }
                >
                  <HelpIcon className={classes.configHelpIcon} />
                </Tooltip>
              </ListSubheader>
            }
          >
            <ListItem>
              <ListItemIcon>
                <CategoryIcon />
              </ListItemIcon>
              <ListItemText primary="Entity Type" />
              <ListItemSecondaryAction>
                <Button
                  size="small"
                  variant="outlined"
                  ref={(ref) => (this.btnEntityRef = ref)}
                  onClick={() => {
                    this.setState({ showEntityMenu: true });
                  }}
                >
                  {configEntityType}
                </Button>
                <Menu
                  anchorEl={this.btnEntityRef}
                  keepMounted
                  open={this.state.showEntityMenu}
                  onClose={() => {
                    this.setState({ showEntityMenu: false });
                  }}
                >
                  <MenuItem onClick={() => this.updateConfig("entity", "ALL")}>
                    ALL
                  </MenuItem>
                  <MenuItem
                    onClick={() => this.updateConfig("entity", "PERSON")}
                  >
                    PERSON
                  </MenuItem>
                  <MenuItem
                    onClick={() => this.updateConfig("entity", "ORGANIZATION")}
                  >
                    ORGANIZATION
                  </MenuItem>
                  <MenuItem
                    onClick={() => this.updateConfig("entity", "LOCATION")}
                  >
                    LOCATION
                  </MenuItem>
                  <MenuItem onClick={() => this.updateConfig("entity", "MISC")}>
                    MISC
                  </MenuItem>
                </Menu>
              </ListItemSecondaryAction>
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <FormatListNumberedIcon />
              </ListItemIcon>
              <ListItemText primary="Result Limit" />
              <ListItemSecondaryAction>
                <Button
                  size="small"
                  variant="outlined"
                  ref={(ref) => (this.btnResultLimitRef = ref)}
                  onClick={() => {
                    this.setState({ showLimitMenu: true });
                  }}
                >
                  {`${configResultLimit}`}
                </Button>
                <Menu
                  anchorEl={this.btnResultLimitRef}
                  keepMounted
                  open={this.state.showLimitMenu}
                  onClose={() => {
                    this.setState({ showLimitMenu: false });
                  }}
                >
                  <MenuItem onClick={() => this.updateConfig("limit", 1)}>
                    1
                  </MenuItem>
                  <MenuItem onClick={() => this.updateConfig("limit", 5)}>
                    5
                  </MenuItem>
                  <MenuItem onClick={() => this.updateConfig("limit", 10)}>
                    10
                  </MenuItem>
                  <MenuItem onClick={() => this.updateConfig("limit", 20)}>
                    20
                  </MenuItem>
                </Menu>
              </ListItemSecondaryAction>
            </ListItem>
          </List>
          <List
            subheader={
              <ListSubheader>
                Node Expanding
                <Tooltip
                  title={
                    <>
                      <Typography color="inherit">
                        Expanding Configurations
                      </Typography>
                      <b>
                        <u>Relationship Type</u>
                      </b>{" "}
                      : the type of relationship used to expand the selected
                      node.
                      <br />
                      <br />
                      <b>
                        <u>Expansion Depth</u>
                      </b>{" "}
                      : the maximum depth used in regards to expanding the node.
                      <br />
                      <br />
                      <b>
                        <u>Expansion Limit</u>
                      </b>{" "}
                      : the maximum number of nodes being returned from node
                      expansion process.
                      <br />
                      <br />
                      <b>
                        <u>Next Page Behaviour</u>
                      </b>{" "}
                      : selecting <em>CLEAR</em> would clear the existing node
                      when going to the next page, while <em>KEEP</em> will do
                      the opposite.
                    </>
                  }
                >
                  <HelpIcon className={classes.configHelpIcon} />
                </Tooltip>
              </ListSubheader>
            }
          >
            <ListItem>
              <ListItemIcon>
                <DeviceHubIcon />
              </ListItemIcon>
              <ListItemText primary="Relationship Type" />
              <ListItemSecondaryAction>
                <Button
                  size="small"
                  variant="outlined"
                  ref={(ref) => (this.btnRelationshipRef = ref)}
                  onClick={() => {
                    this.setState({ showRelationshipMenu: true });
                  }}
                >
                  {configRelationship}
                </Button>
                <Menu
                  anchorEl={this.btnRelationshipRef}
                  keepMounted
                  open={this.state.showRelationshipMenu}
                  onClose={() => {
                    this.setState({ showRelationshipMenu: false });
                  }}
                >
                  <MenuItem
                    onClick={() =>
                      this.updateConfig("relationship", "SAME DOCUMENT")
                    }
                  >
                    Same Document
                  </MenuItem>
                  <MenuItem
                    onClick={() =>
                      this.updateConfig("relationship", "SAME SENTENCE")
                    }
                  >
                    Same Sentence
                  </MenuItem>
                </Menu>
              </ListItemSecondaryAction>
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <AccountTreeIcon />
              </ListItemIcon>
              <ListItemText primary="Expansion Depth" />
              <ListItemSecondaryAction>
                <Button
                  size="small"
                  variant="outlined"
                  ref={(ref) => (this.btnDepthRef = ref)}
                  onClick={() => {
                    this.setState({ showDepthMenu: true });
                  }}
                >
                  {`${configDepth}`}
                </Button>
                <Menu
                  anchorEl={this.btnDepthRef}
                  keepMounted
                  open={this.state.showDepthMenu}
                  onClose={() => {
                    this.setState({ showDepthMenu: false });
                  }}
                >
                  <MenuItem onClick={() => this.updateConfig("depth", 1)}>
                    1
                  </MenuItem>
                  <MenuItem onClick={() => this.updateConfig("depth", 2)}>
                    2
                  </MenuItem>
                  <MenuItem onClick={() => this.updateConfig("depth", 3)}>
                    3
                  </MenuItem>
                </Menu>
              </ListItemSecondaryAction>
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <FormatListNumberedIcon />
              </ListItemIcon>
              <ListItemText primary="Expansion Limit" />
              <ListItemSecondaryAction>
                <Button
                  size="small"
                  variant="outlined"
                  ref={(ref) => (this.btnExpandLimitRef = ref)}
                  onClick={() => {
                    this.setState({ showExpandLimitMenu: true });
                  }}
                >
                  {`${configExpandResultLimit}`}
                </Button>
                <Menu
                  anchorEl={this.btnExpandLimitRef}
                  keepMounted
                  open={this.state.showExpandLimitMenu}
                  onClose={() => {
                    this.setState({ showExpandLimitMenu: false });
                  }}
                >
                  <MenuItem onClick={() => this.updateConfig("expandlimit", 5)}>
                    5
                  </MenuItem>
                  <MenuItem
                    onClick={() => this.updateConfig("expandlimit", 10)}
                  >
                    10
                  </MenuItem>
                  <MenuItem
                    onClick={() => this.updateConfig("expandlimit", 20)}
                  >
                    20
                  </MenuItem>
                  <MenuItem
                    onClick={() => this.updateConfig("expandlimit", 30)}
                  >
                    30
                  </MenuItem>
                </Menu>
              </ListItemSecondaryAction>
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <FileCopyIcon />
              </ListItemIcon>
              <ListItemText primary="Next Page Behaviour" />
              <ListItemSecondaryAction>
                <Button
                  size="small"
                  variant="outlined"
                  ref={(ref) => (this.btnNextPageConfigRef = ref)}
                  onClick={() => {
                    this.setState({ showNextPageConfigMenu: true });
                  }}
                >
                  {`${configNextPageBehaviour}`}
                </Button>
                <Menu
                  anchorEl={this.btnNextPageConfigRef}
                  keepMounted
                  open={this.state.showNextPageConfigMenu}
                  onClose={() => {
                    this.setState({ showNextPageConfigMenu: false });
                  }}
                >
                  <MenuItem
                    onClick={() => this.updateConfig("nextpage", "CLEAR")}
                  >
                    CLEAR
                  </MenuItem>
                  <MenuItem
                    onClick={() => this.updateConfig("nextpage", "KEEP")}
                  >
                    KEEP
                  </MenuItem>
                </Menu>
              </ListItemSecondaryAction>
            </ListItem>
          </List>
        </Menu>
        <Popper
          style={{ zIndex: 9999 }}
          open={this.state.showSearchMenu}
          anchorEl={this.buttonGroupRef}
          role={undefined}
          transition
          disablePortal
        >
          {({ TransitionProps, placement }) => (
            <Grow
              {...TransitionProps}
              style={{
                transformOrigin:
                  placement === "bottom" ? "center top" : "center bottom",
              }}
            >
              <Paper>
                <ClickAwayListener
                  onClickAway={() => this.setState({ showSearchMenu: false })}
                >
                  <MenuList id="split-button-menu">
                    <MenuItem
                      onClick={() => {
                        dispatch({
                          type: "EXECUTE_TOP_ENTITIES",
                          id: uuid.v4(),
                          project,
                        });
                        this.setState({ showSearchMenu: false });
                      }}
                    >
                      Show Top Entities
                    </MenuItem>
                    <MenuItem
                      divider
                      onClick={() => {
                        dispatch({
                          type: "EXECUTE_LUCKY",
                          id: uuid.v4(),
                          project,
                        });
                        this.setState({ showSearchMenu: false });
                      }}
                    >
                      I'm feeling lucky!
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        dispatch({ type: "CLEAR_QUERY_HISTORY" });
                        this.setState({ showSearchMenu: false });
                      }}
                    >
                      Clear Query History
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        dispatch({ type: "CLEAR_GRAPH" });
                        this.setState({ showSearchMenu: false });
                      }}
                    >
                      Clear Graph
                    </MenuItem>
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper>
        {info ? (
          <Dialog
            open={this.state.infoReadMore}
            onClose={() => this.setState({ infoReadMore: false })}
            scroll="paper"
            aria-labelledby="scroll-dialog-title"
            aria-describedby="scroll-dialog-description"
          >
            <DialogTitle id="scroll-dialog-title">
              {info.kind === "ENTITY" ? info.name : info.file}
            </DialogTitle>
            <DialogContent dividers>
              <DialogContentText id="scroll-dialog-description" tabIndex={-1}>
                {info.image ? (
                  <img
                    src={`https://images.weserv.nl/?w=150&h=200&fit=cover&url=ssl:${info.image}`}
                    className={classes.infoReadMoreImage}
                  />
                ) : null}
                {info.summary
                  ? info.summary
                      .split("\n")
                      .map((txt, i) => <p key={i}>{txt}</p>)
                  : null}
                {info.text && info.offset
                  ? highlightText(info.text, info.offset)
                  : null}
                {info.text && !info.offset
                  ? info.text.split("\n").map((txt, i) => <p key={i}>{txt}</p>)
                  : null}
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => this.setState({ infoReadMore: false })}
                color="primary"
              >
                Close
              </Button>
            </DialogActions>
          </Dialog>
        ) : null}
      </>
    );
  }
}
export default connect((state) => ({
  cursors: state.explore.cursors,
  configDepth: state.explore.configDepth,
  configExpandResultLimit: state.explore.configExpandResultLimit,
  configNextPageBehaviour: state.explore.configNextPageBehaviour,
  configRelationship: state.explore.configRelationship,
  configResultLimit: state.explore.configResultLimit,
  configEntityType: state.explore.configEntityType,
  info: state.explore.info,
  queries: state.explore.queries,
  history: state.explore.history,
  loading: state.explore.loading,
  data: state.explore.data,
  error: state.explore.error,
}))(withStyles(styles)(Explore));
