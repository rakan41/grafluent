import React, { useEffect } from "react";
import { connect } from "react-redux";

import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import Alert from "@material-ui/lab/Alert";
import AddIcon from "@material-ui/icons/Add";
import FindInPage from "@material-ui/icons/FindInPage";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import TextField from "@material-ui/core/TextField";
import DialogTitle from "@material-ui/core/DialogTitle";
import LinearProgress from "@material-ui/core/LinearProgress";

import { withStyles } from "@material-ui/core/styles";
import { withRouter } from "react-router-dom";
import Joyride, {
  CallBackProps,
  STATUS,
  ACTIONS,
  Step,
  StoreHelpers,
} from "react-joyride";

import Header from "./Header";

const styles = (theme) => ({
  loading: {
    marginTop: "0px",
    position: "sticky",
    top: "48px",
    zIndex: 99999,
  },
  projectLink: {
    textDecoration: "none",
  },
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
  skeleton: {
    width: "100%",
    height: "100%",
  },
  loading: {
    marginTop: "0px",
    position: "relative",
    zIndex: 999,
  },
  loadingContent: {
    position: "absolute",
    top: "0",
    left: "0",
    right: "0",
  },
});

function Home({
  dispatch,
  classes,
  projects,
  history,
  error,
  loading,
  runHelp,
}) {
  const [open, setOpen] = React.useState(false);
  const txtName = React.useRef(null);
  useEffect(() => {
    dispatch({ type: "LOAD_PROJECTS" });
  }, []);
  const handleClose = () => {
    setOpen(false);
  };
  const handleCreate = () => {
    if (!txtName) return;
    dispatch({ type: "CREATE_PROJECT", name: txtName.current.value });
    setOpen(false);
  };

  return (
    <>
      <Header />
      {loading ? (
        <div className={classes.loading}>
          <LinearProgress className={classes.loadingContent} />
        </div>
      ) : null}
      <main className={classes.main}>
        {error ? (
          <Alert severity="error" style={{ marginBottom: "10px" }}>
            {error}
          </Alert>
        ) : null}
        <Grid container spacing={2}>
          <Grid item xs={3}>
            <Paper
              className={`${classes.paper} help-new-project`}
              onClick={() => {
                setOpen(true);
              }}
            >
              <div className={classes.contentWrapper}>
                <AddIcon color="primary" style={{ fontSize: 70 }} />
                <Typography color="textSecondary" align="center">
                  New Project
                </Typography>
              </div>
            </Paper>
          </Grid>
          {projects.map((project) => (
            <Grid key={project.id} item xs={3}>
              <a
                className={classes.projectLink}
                href={`/project/${project.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  history.push(`/project/${project.id}`);
                  dispatch({ type: "OPEN_PROJECT", id: project.id });
                }}
              >
                <Paper className={classes.paper}>
                  <div className={classes.contentWrapper}>
                    <FindInPage color="primary" className={classes.dataIcon} />
                    <Typography
                      color="textSecondary"
                      align="center"
                      className={classes.fileName}
                    >
                      {project.name}
                    </Typography>
                  </div>
                </Paper>
              </a>
            </Grid>
          ))}
          {/* {loading ? (
            <>
              <Grid item xs={3}>
                <Paper className={classes.paper}>
                  <div className={classes.contentWrapper}>
                    <Skeleton width={60} height={70} />
                    <Typography
                      color="textSecondary"
                      align="center"
                      className={classes.fileName}
                    >
                      <Skeleton width={170} />
                    </Typography>
                  </div>
                </Paper>
              </Grid>
              <Grid item xs={3}>
                <Paper className={classes.paper}>
                  <div className={classes.contentWrapper}>
                    <Skeleton width={60} height={70} />
                    <Typography
                      color="textSecondary"
                      align="center"
                      className={classes.fileName}
                    >
                      <Skeleton width={170} />
                    </Typography>
                  </div>
                </Paper>
              </Grid>
            </>
          ) : null} */}
        </Grid>
      </main>
      <Joyride
        run={runHelp}
        continuous={true}
        scrollToFirstStep={true}
        showSkipButton={true}
        steps={[
          {
            content: <h2>Welcome to Grafluent!</h2>,
            locale: { skip: <strong aria-label="skip">Skip</strong> },
            placement: "center",
            target: "body",
          },
          {
            target: ".help-new-project",
            content: "Use this button to create new projects.",
          },
          {
            target: ".help-notification",
            content: "You will find notifications in this menu.",
          },
          {
            target: ".help-user-icon",
            content:
              "To log out from the system, click this menu and select Logout",
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
            dispatch({ type: "STOP_HOME_HELP" });
          }
        }}
      />
      <Dialog
        fullWidth
        maxWidth="xs"
        open={open}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">New Project</DialogTitle>
        <DialogContent>
          <TextField
            inputRef={txtName}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreate();
            }}
            autoFocus
            margin="dense"
            id="name"
            label="Project Name"
            type="text"
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleCreate} color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default connect((state) => ({
  runHelp: state.home.runHelp,
  projects: state.home.projects,
  loading: state.home.loading,
  error: state.home.error,
}))(withRouter(withStyles(styles)(Home)));
