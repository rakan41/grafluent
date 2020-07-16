import React from "react";
import {
  createMuiTheme,
  ThemeProvider,
  withStyles,
} from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import { Router, Route, Switch } from "react-router-dom";
import { connect } from "react-redux";

import Header from "./components/Header";
import Home from "./pages/Home";
import Explore from "./pages/Explore";
import Data from "./pages/Dataset";
import Settings from "./pages/Settings";

import { history } from "./history";
import Login from "./pages/Login/login";
import Register from "./pages/Login/register";
import Landingpage from "./pages/Login/landing";
import "./App.css";

let theme = createMuiTheme({
  palette: {
    primary: {
      light: "#63ccff",
      main: "#009be5",
      dark: "#006db3",
    },
  },
  typography: {
    h5: {
      fontWeight: 500,
      fontSize: 26,
      letterSpacing: 0.5,
    },
  },
  shape: {
    borderRadius: 8,
  },
  props: {
    MuiTab: {
      disableRipple: true,
    },
  },
  mixins: {
    toolbar: {
      minHeight: 48,
    },
  },
});

theme = {
  ...theme,
  overrides: {
    MuiDrawer: {
      paper: {
        backgroundColor: "#18202c",
      },
    },
    MuiButton: {
      label: {
        textTransform: "none",
      },
      contained: {
        boxShadow: "none",
        "&:active": {
          boxShadow: "none",
        },
      },
    },
    MuiTabs: {
      root: {
        marginLeft: theme.spacing(1),
      },
      indicator: {
        height: 3,
        borderTopLeftRadius: 3,
        borderTopRightRadius: 3,
        backgroundColor: theme.palette.common.white,
      },
    },
    MuiTab: {
      root: {
        textTransform: "none",
        margin: "0 16px",
        minWidth: 0,
        padding: 0,
        [theme.breakpoints.up("md")]: {
          padding: 0,
          minWidth: 0,
        },
      },
    },
    MuiIconButton: {
      root: {
        padding: theme.spacing(1),
      },
    },
    MuiTooltip: {
      tooltip: {
        borderRadius: 4,
      },
    },
    MuiDivider: {
      root: {
        backgroundColor: "#404854",
      },
    },
    MuiListItemText: {
      primary: {
        fontWeight: theme.typography.fontWeightMedium,
      },
    },
    MuiListItemIcon: {
      root: {
        color: "inherit",
        marginRight: 0,
        "& svg": {
          fontSize: 20,
        },
      },
    },
    MuiAvatar: {
      root: {
        width: 32,
        height: 32,
      },
    },
  },
};

const drawerWidth = 256;

const styles = {
  app: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  root: {
    display: "flex",
    minHeight: "100vh",
  },
  drawer: {
    [theme.breakpoints.up("sm")]: {
      width: drawerWidth,
      flexShrink: 0,
    },
  },
  footer: {
    padding: theme.spacing(2),
    background: "#eaeff1",
  },
};

function App({ classes, auth }) {
  return (
    <Router history={history}>
      <ThemeProvider theme={theme}>
        <div className={classes.root}>
          <CssBaseline />
          <div className={classes.app}>
            <Switch>
              <Route path="/project/:id" exact component={Header} />
              <Route path="/project/:id/data" exact component={Header} />
              <Route path="/project/:id/settings" exact component={Header} />
            </Switch>
            <Switch>
              <Route path="/" exact component={auth ? Home : Landingpage} />
              <Route path="/login" exact component={Login} />
              <Route path="/register" exact component={Register} />
              <Route path="/project/:id" exact component={Explore} />
              <Route path="/project/:id/data" exact component={Data} />
              <Route path="/project/:id/settings" exact component={Settings} />
            </Switch>
          </div>
        </div>
      </ThemeProvider>
    </Router>
  );
}

export default connect((state) => ({
  auth: state.app.auth,
}))(withStyles(styles)(App));
