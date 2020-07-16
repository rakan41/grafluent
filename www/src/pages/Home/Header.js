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
import { withStyles } from "@material-ui/core/styles";
import { withRouter } from "react-router-dom";
import { indigo } from "@material-ui/core/colors";

import UserIcon from "../../components/UserIcon";
import Notification from "../../components/Notification";

const lightColor = "rgba(255, 255, 255, 0.7)";

const styles = (theme) => ({
  header: {
    color: theme.palette.getContrastText(indigo[500]),
    backgroundColor: "#232f3e", //indigo[500]
  },
  secondaryBar: {
    paddingTop: "20px",
    zIndex: 0,
    paddingBottom: "10px",
  },
  menuButton: {
    marginLeft: -theme.spacing(1),
  },
  iconButtonAvatar: {
    padding: 4,
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

function Header(props) {
  const { classes, onDrawerToggle, match, history, data, dispatch } = props;

  return (
    <React.Fragment>
      <AppBar
        component="div"
        className={`${classes.secondaryBar} ${classes.header}`}
        position="static"
        elevation={0}
      >
        <Toolbar>
          <Grid container alignItems="center" spacing={1}>
            <Grid item xs>
              <Typography color="inherit" variant="h5" component="h1">
                My Projects
              </Typography>
            </Grid>
            <Grid item>
              <Tooltip title="Help">
                <IconButton
                  color="inherit"
                  onClick={() => dispatch({ type: "START_HOME_HELP" })}
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
    </React.Fragment>
  );
}

export default connect((state) => ({
  data: state.explore.data,
}))(withRouter(withStyles(styles)(Header)));
