import React, { useEffect, useRef } from "react";
import { connect } from "react-redux";

import AddIcon from "@material-ui/icons/Add";
import DescriptionIcon from "@material-ui/icons/Description";
import TwitterIcon from "@material-ui/icons/Twitter";
import CodeIcon from "@material-ui/icons/Code";
import SettingsIcon from "@material-ui/icons/Settings";

import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

import BottomNavigation from "@material-ui/core/BottomNavigation";
import BottomNavigationAction from "@material-ui/core/BottomNavigationAction";
import CircularProgress from "@material-ui/core/CircularProgress";

import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import LinearProgress from "@material-ui/core/LinearProgress";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import TextField from "@material-ui/core/TextField";
import { withStyles } from "@material-ui/core/styles";
import { withRouter } from "react-router-dom";

import UploadSettings from "./UploadSettings";

const styles = (theme) => ({
  paper: {
    margin: "auto",
    overflow: "hidden",
    marginBottom: "30px",
    minHeight: "155px",
    cursor: "pointer",
  },
  searchBar: {
    borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
    zIndex: 400,
  },
  block: {
    display: "block",
  },
  dataIcon: {
    fontSize: 70,
  },
  fileName: {
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    overflow: "hidden",
  },
  loadingBlock: {
    padding: "20px",
  },
  loadingText: {
    marginTop: "8px",
  },
  contentWrapper: {
    margin: "30px 16px",
    textAlign: "center",
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
  fileLoading: {
    marginLeft: "5px",
  },
});

function getAPIDialogText(type) {
  switch (type) {
    case "Twitter":
      return {
        title: "Add the Twitter API",
        label: "Enter a Twitter username",
      };
    case "Wikipedia":
      return {
        title: "Add the Wikipedia API",
        label: "Enter Wikipedia search keywords",
      };
    default:
      return {
        title: "Add the News API",
        label: "Enter News API search keywords",
      };
  }
}

function getSourceIcon(type, classes) {
  switch (type) {
    case "Wikipedia":
    case "News":
      return <CodeIcon color="primary" className={classes.dataIcon} />;
    case "Twitter":
      return <TwitterIcon color="primary" className={classes.dataIcon} />;
    case "PDF":
    default:
      return <DescriptionIcon color="primary" className={classes.dataIcon} />;
  }
}

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}

function toFileName(keyword, api) {
  let prefix = "";
  switch (api) {
    case "Twitter":
      prefix = "twitter_";
      break;
    case "Wikipedia":
      prefix = "wiki_";
      break;
    case "News":
      prefix = "news_";
      break;
  }
  return `${prefix}${keyword}.csv`.replace(/ /g, "_").toLowerCase();
}

function Data({
  loading,
  dispatch,
  classes,
  sources,
  showDialog,
  processing,
  match,
  documents,
  showAPI,
}) {
  const { id } = match.params;
  const txtAPI = useRef(null);
  useEffect(() => {
    dispatch({ type: "LOAD_DATASET", id });
  }, [id]);

  const handleCloseAPI = () => {
    dispatch({ type: "CLOSE_DATASOURCE_API" });
  };

  const handleCreateAPI = () => {
    if (!txtAPI) return;
    dispatch({
      type: "ADD_DATASOURCE_API",
      file: toFileName(txtAPI.current.value, showAPI),
      project: id,
      api: showAPI,
      keyword: txtAPI.current.value,
    });
  };

  return (
    <>
      {loading ? (
        <div className={classes.loading}>
          <LinearProgress className={classes.loadingContent} />
        </div>
      ) : null}
      <main className={classes.main}>
        <Grid container spacing={2}>
          <Grid item xs={3}>
            <Paper
              className={classes.paper}
              onClick={() => {
                dispatch({ type: "OPEN_ADD_DIALOG" });
              }}
            >
              <div className={classes.contentWrapper}>
                <AddIcon color="primary" style={{ fontSize: 70 }} />
                <Typography color="textSecondary" align="center">
                  Add New Data Source
                </Typography>
              </div>
            </Paper>
          </Grid>
          {sources.map((id) => {
            const doc = documents[id];
            return (
              <Grid key={id} item xs={3}>
                <Paper className={classes.paper}>
                  <div className={classes.contentWrapper}>
                    {getSourceIcon(doc.type, classes)}
                    <Typography
                      color="textSecondary"
                      align="center"
                      className={classes.fileName}
                    >
                      {doc.name}
                      {doc.loading ? (
                        <CircularProgress
                          size={12}
                          className={classes.fileLoading}
                        />
                      ) : null}
                    </Typography>
                  </div>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </main>
      <Dialog open={processing} aria-labelledby="form-dialog-title">
        <DialogContent className={classes.loadingBlock}>
          <Grid container spacing={2}>
            <Grid item>
              <CircularProgress />
            </Grid>
            <Grid item>
              <DialogContentText className={classes.loadingText}>
                Processing... Please wait ...
              </DialogContentText>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
      <Dialog
        open={showDialog}
        onClose={() => {
          dispatch({ type: "CLOSE_ADD_DIALOG" });
        }}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">New Data Source</DialogTitle>
        <DialogContent>
          <BottomNavigation showLabels>
            <BottomNavigationAction
              label="Upload"
              icon={<DescriptionIcon />}
              onClick={() => {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = ".pdf,.txt,.csv,.epub";
                input.onchange = async (e) => {
                  if (e.target.files.length === 0) return;
                  const file = e.target.files[0];
                  const content = await toBase64(file);

                  dispatch({
                    type: "UPLOAD_DOCUMENT",
                    name: file.name,
                    id,
                    content,
                  });
                };
                input.click();
              }}
            />
            <BottomNavigationAction
              label="Twitter"
              icon={<TwitterIcon />}
              onClick={() =>
                dispatch({ type: "OPEN_DATASOURCE_API", api: "Twitter" })
              }
            />
            <BottomNavigationAction
              label="News API"
              icon={<CodeIcon />}
              onClick={() =>
                dispatch({ type: "OPEN_DATASOURCE_API", api: "News" })
              }
            />
            <BottomNavigationAction
              label="Wikipedia"
              icon={<CodeIcon />}
              onClick={() =>
                dispatch({ type: "OPEN_DATASOURCE_API", api: "Wikipedia" })
              }
            />
            <BottomNavigationAction
              label="Settings"
              icon={<SettingsIcon />}
              onClick={() => dispatch({ type: "OPEN_SETTINGS_DIALOG" })}
            />
          </BottomNavigation>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              dispatch({ type: "CLOSE_ADD_DIALOG" });
            }}
            color="primary"
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
      <UploadSettings />
      <Dialog
        fullWidth
        maxWidth="xs"
        open={showAPI}
        onClose={handleCloseAPI}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">
          {getAPIDialogText(showAPI).title}
        </DialogTitle>
        <DialogContent>
          <TextField
            inputRef={txtAPI}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreateAPI();
            }}
            autoFocus
            margin="dense"
            id="name"
            label={getAPIDialogText(showAPI).label}
            type="text"
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAPI} color="primary">
            Cancel
          </Button>
          <Button onClick={handleCreateAPI} color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default connect((state) => ({
  loading: state.data.loading,
  documents: state.data.documents,
  sources: state.data.sources,
  showDialog: state.data.showDialog,
  showAPI: state.data.showAPI,
  processing: state.data.processing,
}))(withRouter(withStyles(styles)(Data)));
