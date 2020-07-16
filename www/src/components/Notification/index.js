import React, { useState, useRef } from "react";
import { connect } from "react-redux";
import LinearProgress from "@material-ui/core/LinearProgress";
import Tooltip from "@material-ui/core/Tooltip";
import IconButton from "@material-ui/core/IconButton";
import NotificationsIcon from "@material-ui/icons/Notifications";
import DescriptionIcon from "@material-ui/icons/Description";
import CodeIcon from "@material-ui/icons/Code";
import TwitterIcon from "@material-ui/icons/Twitter";
import Menu from "@material-ui/core/Menu";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import Badge from "@material-ui/core/Badge";
import Divider from "@material-ui/core/Divider";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Avatar from "@material-ui/core/Avatar";
import Typography from "@material-ui/core/Typography";
import { withStyles } from "@material-ui/core/styles";
import { red, green } from "@material-ui/core/colors";

const styles = (theme) => ({
  error: {
    color: theme.palette.getContrastText(red[500]),
    backgroundColor: red[500],
  },
  success: {
    color: theme.palette.getContrastText(green[500]),
    backgroundColor: green[500],
  },
  progress: {
    marginTop: "6px",
  },
  listContainer: {
    "& ul": {
      width: "500px",
      padding: 0,
    },
  },
  popper: {
    zIndex: 99999,
  },
  iconButtonAvatar: {
    padding: 4,
  },
});

function getSourceIcon(type) {
  switch (type) {
    case "Wikipedia":
    case "News":
      return <CodeIcon />;
    case "Twitter":
      return <TwitterIcon />;
    case "PDF":
    default:
      return <DescriptionIcon />;
  }
}

function getUploadText(status, name, type) {
  if (type === "PDF") {
    switch (status) {
      case "processing":
        return `Processing ${name} ...`;
      case "S3":
        return `Uploading ${name} ...`;
    }
  }
  switch (status) {
    case "processing":
      return `Processing ${name} ...`;
    case "S3":
      return `Enabling ${type} API: ${name} ...`;
  }
}

function Notification({ classes, newNotif, show, dispatch, uploads, notifs }) {
  const anchorRef = useRef(null);

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    dispatch({ type: "CLOSE_NOTIFICATION" });
  };

  return (
    <>
      <Tooltip title={newNotif ? "New Notification" : "No New Notification"}>
        <IconButton
          ref={anchorRef}
          color="inherit"
          className="help-notification"
          onClick={() => dispatch({ type: "OPEN_NOTIFICATION" })}
        >
          <Badge color="secondary" badgeContent="1" invisible={!newNotif}>
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>
      <Menu
        open={show}
        keepMounted
        onClose={handleClose}
        anchorEl={anchorRef.current}
        getContentAnchorEl={null}
        className={classes.listContainer}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <>
          {Object.keys(uploads).map((name) => (
            <ListItem alignItems="flex-start" divider key={`upload-${name}`}>
              <ListItemAvatar>
                <Avatar>{getSourceIcon(uploads[name].type)}</Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={getUploadText(
                  uploads[name].status,
                  name,
                  uploads[name].type
                )}
                secondary={
                  <React.Fragment>
                    <LinearProgress
                      variant={
                        uploads[name].status !== "S3"
                          ? "determinate"
                          : undefined
                      }
                      value={uploads[name].progress}
                      className={classes.progress}
                    />
                  </React.Fragment>
                }
              />
            </ListItem>
          ))}
          {notifs.map((notif, i) => (
            <ListItem
              key={notif.id}
              alignItems="flex-start"
              divider
              selected={newNotif && i == 0}
            >
              {notif.error ? (
                <>
                  <ListItemAvatar>
                    <Avatar className={classes.error}>
                      {getSourceIcon(notif.type)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`Error processing ${notif.name}`}
                    secondary={`Error: ${notif.error}`}
                  />
                </>
              ) : (
                <>
                  <ListItemAvatar>
                    <Avatar className={classes.success}>
                      {getSourceIcon(notif.type)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${notif.name} is ready`}
                    secondary={`${notif.name} has been processed and ready to be used.`}
                  />
                </>
              )}
            </ListItem>
          ))}
          <ListItem alignItems="flex-start">
            <ListItemAvatar>
              <Avatar alt="G" src="/static/images/avatar/2.jpg" />
            </ListItemAvatar>
            <ListItemText
              primary="Welcome!"
              secondary={
                <React.Fragment>
                  Thank you for choosing Grafluent!
                </React.Fragment>
              }
            />
          </ListItem>
        </>
      </Menu>
    </>
  );
}

export default connect((state) => ({
  notifs: state.notification.notifs,
  uploads: state.notification.uploads,
  show: state.notification.show,
  newNotif: state.notification.newNotif,
}))(withStyles(styles)(Notification));
