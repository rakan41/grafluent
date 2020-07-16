import React from "react";
import { connect } from "react-redux";
import { withStyles } from "@material-ui/core/styles";
import Switch from "@material-ui/core/Switch";
import Dialog from "@material-ui/core/Dialog";
import Button from "@material-ui/core/Button";
import DialogActions from "@material-ui/core/DialogActions";
import TextField from "@material-ui/core/TextField";
import HelpIcon from "@material-ui/icons/HelpOutline";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import ListItemText from "@material-ui/core/ListItemText";
import ListSubheader from "@material-ui/core/ListSubheader";
import Tooltip from "@material-ui/core/Tooltip";
import Typography from "@material-ui/core/Typography";

const styles = (theme) => ({
  configs: {
    width: "400px",
  },
  configHelpIcon: {
    paddingTop: "10px",
    marginLeft: "4px",
  },
});

const configItems = [
  {
    name: "limit",
    text: "Limit",
    help: "Numbers of articles to be processed",
    input: true,
  },
  {
    name: "close",
    text: "Close",
    help: "Close engine after running",
  },
  {
    name: "relations",
    text: "Relations",
    help: "Extract semantic relations (much slower)",
  },
  {
    name: "corefs",
    text: "Co-Reference",
    help: "Resolve coreferences",
  },
  {
    name: "pictures",
    text: "Pictures",
    help:
      "Get wikipedia image urls for vertices (can be slow with a lot of vertices)",
  },
  {
    name: "summary",
    text: "Summary",
    help:
      "Get wikipedia summary for vertices (can be slow with a lot of vertices)",
  },
  {
    name: "newgraph",
    text: "New Graph",
    help: "Overwrite existing graph. Otherwise it will append.",
  },
  {
    name: "documentedges",
    text: "Document Edges",
    help: "Extract same document edges.",
  },
];

function UploadSettings({ show, dispatch, classes, configs }) {
  return (
    <Dialog
      open={show}
      onClose={() => {
        dispatch({ type: "CLOSE_SETTINGS_DIALOG" });
      }}
      aria-labelledby="form-dialog-title"
    >
      <List
        className={classes.configs}
        subheader={
          <ListSubheader>
            Upload Configurations
            <Tooltip
              title={
                <>
                  <Typography color="inherit">Configurations</Typography>
                  {configItems.map((item) => (
                    <span key={item.name}>
                      <b>
                        <u>{item.text}</u>
                      </b>{" "}
                      : {item.help}
                      <br />
                      <br />
                    </span>
                  ))}
                </>
              }
            >
              <HelpIcon className={classes.configHelpIcon} />
            </Tooltip>
          </ListSubheader>
        }
      >
        {configItems.map((item) => (
          <ListItem>
            <ListItemText primary={item.text} />
            <ListItemSecondaryAction>
              {item.input ? (
                <TextField
                  style={{ width: "50px" }}
                  size="small"
                  variant="outlined"
                  value={configs[item.name]}
                  onChange={(e) =>
                    dispatch({
                      type: "UPDATE_UPLOAD_CONFIGS",
                      key: item.name,
                      value: e.target.value,
                    })
                  }
                />
              ) : (
                <Switch
                  color="primary"
                  checked={configs[item.name]}
                  onChange={(e) =>
                    dispatch({
                      type: "UPDATE_UPLOAD_CONFIGS",
                      key: item.name,
                      value: e.target.checked,
                    })
                  }
                />
              )}
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
      <DialogActions>
        <Button
          onClick={() => {
            dispatch({ type: "CLOSE_SETTINGS_DIALOG" });
          }}
          color="primary"
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default connect((state) => ({
  show: state.data.showSettings,
  configs: state.data.configs,
}))(withStyles(styles)(UploadSettings));
