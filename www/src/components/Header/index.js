import React from "react";
import { connect } from "react-redux";
import AppBar from "@material-ui/core/AppBar";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import HelpIcon from "@material-ui/icons/Help";
import Hidden from "@material-ui/core/Hidden";
import IconButton from "@material-ui/core/IconButton";

import MenuIcon from "@material-ui/icons/Menu";
import NotificationsIcon from "@material-ui/icons/Notifications";
import Tab from "@material-ui/core/Tab";
import Tabs from "@material-ui/core/Tabs";
import Toolbar from "@material-ui/core/Toolbar";
import Tooltip from "@material-ui/core/Tooltip";
import Typography from "@material-ui/core/Typography";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogActions from "@material-ui/core/DialogActions";

import ShareIcon from "@material-ui/icons/Share";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import GetAppIcon from "@material-ui/icons/GetApp";
import FacebookIcon from "@material-ui/icons/Facebook";
import TwitterIcon from "@material-ui/icons/Twitter";

import BottomNavigation from "@material-ui/core/BottomNavigation";
import BottomNavigationAction from "@material-ui/core/BottomNavigationAction";
import CircularProgress from "@material-ui/core/CircularProgress";

import { withStyles } from "@material-ui/core/styles";
import { withRouter } from "react-router-dom";

import UserIcon from "../UserIcon";
import Notification from "../Notification";

import Joyride, {
  CallBackProps,
  STATUS,
  ACTIONS,
  Step,
  StoreHelpers,
} from "react-joyride";

const lightColor = "rgba(255, 255, 255, 0.7)";

const styles = (theme) => ({
  secondaryBar: {
    paddingTop: "20px",
    zIndex: 0,
  },
  menuButton: {
    marginLeft: -theme.spacing(1),
  },
  link: {
    textDecoration: "none",
    color: lightColor,
    "&:hover": {
      color: theme.palette.common.white,
    },
  },
  button: {
    borderColor: lightColor,
  },
});

function getPathIndex(pathname) {
  switch (pathname) {
    case "/project/:id":
      return 0;
    case "/project/:id/data":
      return 1;
    case "/project/:id/settings":
      return 2;
  }
}

function Header(props) {
  const {
    classes,
    shareLoading,
    runHelp,
    onDrawerToggle,
    match,
    history,
    data,
    dispatch,
    showShareDialog,
  } = props;
  const { id } = match.params;
  return (
    <>
      <Dialog open={shareLoading} aria-labelledby="form-dialog-title">
        <DialogContent className={classes.loadingBlock}>
          <Grid container spacing={2}>
            <Grid item>
              <CircularProgress />
            </Grid>
            <Grid item>
              <DialogContentText className={classes.loadingText}>
                Compiling Graph ...
              </DialogContentText>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
      <Dialog
        open={showShareDialog}
        onClose={() => {
          dispatch({ type: "CLOSE_SHARE_DIALOG" });
        }}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Share Graph</DialogTitle>
        <DialogContent>
          <BottomNavigation showLabels>
            <BottomNavigationAction
              label="Download"
              icon={<GetAppIcon />}
              onClick={() =>
                dispatch({ type: "SHARE_GRAPH", kind: "download" })
              }
            />
            <BottomNavigationAction
              label="Facebook"
              icon={<FacebookIcon />}
              onClick={() =>
                dispatch({ type: "SHARE_GRAPH", kind: "facebook" })
              }
            />
            <BottomNavigationAction
              label="Twitter"
              icon={<TwitterIcon />}
              onClick={() => dispatch({ type: "SHARE_GRAPH", kind: "twitter" })}
            />
          </BottomNavigation>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              dispatch({ type: "CLOSE_SHARE_DIALOG" });
            }}
            color="primary"
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
      <React.Fragment>
        <AppBar
          component="div"
          className={classes.secondaryBar}
          color="primary"
          position="static"
          elevation={0}
        >
          <Toolbar>
            <Grid container alignItems="center" spacing={1}>
              <Grid item>
                <IconButton
                  color="inherit"
                  onClick={() => {
                    history.push("/");
                  }}
                  className={classes.menuButton}
                >
                  <ArrowBackIcon />
                </IconButton>
              </Grid>
              <Grid item xs>
                <Typography color="inherit" variant="h5" component="h1">
                  {id || "Untitled Project"}
                </Typography>
              </Grid>
              <Grid item>
                <Tooltip title="Share Graph" className="help-share-project">
                  <IconButton
                    color="inherit"
                    disabled={!data}
                    onClick={() => dispatch({ type: "OPEN_SHARE_GRAPH" })}
                  >
                    <ShareIcon />
                  </IconButton>
                </Tooltip>
              </Grid>
              <Grid item>
                <Tooltip title="Help">
                  <IconButton
                    color="inherit"
                    onClick={() => dispatch({ type: "START_EXPLORE_HELP" })}
                  >
                    <HelpIcon />
                  </IconButton>
                </Tooltip>
              </Grid>
              <Grid item>
                <Notification />
              </Grid>
              <Grid item>
                <UserIcon />
              </Grid>
            </Grid>
          </Toolbar>
        </AppBar>
        <AppBar component="div" color="primary" position="sticky" elevation={0}>
          <Tabs value={getPathIndex(match.path)} textColor="inherit">
            <Tab
              className="help-tab-explore"
              textColor="inherit"
              label="Explore"
              onClick={() => history.push(`/project/${id}`)}
            />
            <Tab
              className="help-tab-data"
              textColor="inherit"
              label="Data"
              onClick={() => history.push(`/project/${id}/data`)}
            />
          </Tabs>
        </AppBar>
      </React.Fragment>
      <Joyride
        run={runHelp}
        continuous={true}
        scrollToFirstStep={true}
        showSkipButton={true}
        steps={[
          {
            content: <h2>Grafluent Explore</h2>,
            locale: { skip: <strong aria-label="skip">Skip</strong> },
            placement: "center",
            target: "body",
          },
          {
            target: ".help-share-project",
            content: "Use this button to share this project",
          },
          {
            target: ".help-tab-explore",
            content: "This is where you can explore your data.",
          },
          {
            target: ".help-tab-data",
            content: "You can add datasource or APIs here.",
          },
          {
            target: ".help-explore-inputtext",
            content: "You can enter your search keywords here",
          },
          {
            target: ".help-explore-config-button",
            content: "Use this button to modify your searching configurations",
          },
          {
            target: ".help-explore-search-button",
            content: "You can find more options by clicking the down arrow.",
          },
          {
            target: ".help-explore-graph",
            content: "This graph is clickable and zoomable (scroll).",
          },
        ]}
        styles={{
          options: {
            zIndex: 9999,
          },
        }}
        callback={(data) => {
          const { action, status, type } = data;
          const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];
          if (finishedStatuses.includes(status) || action === ACTIONS.CLOSE) {
            dispatch({ type: "STOP_EXPLORE_HELP" });
          }
        }}
      />
    </>
  );
}

export default connect((state) => ({
  runHelp: state.explore.runHelp,
  shareLoading: state.explore.shareLoading,
  showShareDialog: state.explore.showShareDialog,
  data: state.explore.data,
}))(withRouter(withStyles(styles)(Header)));
