import React, { useState, useRef } from "react";
import { connect } from "react-redux";
import Avatar from "@material-ui/core/Avatar";
import IconButton from "@material-ui/core/IconButton";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import Typography from "@material-ui/core/Typography";
import { withStyles } from "@material-ui/core/styles";

import imgAim from "./img-aim.png";

const styles = (theme) => ({
  popper: {
    zIndex: 99999,
  },
  iconButtonAvatar: {
    padding: 4,
  },
});

function UserIcon({ classes, dispatch, username }) {
  const [open, setOpen] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const anchorRef = useRef(null);

  const handleClose = (event) => {
    setShowAbout(false);
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const initial = username.length ? username[0].toUpperCase() : "X";

  return (
    <>
      <IconButton
        color="inherit"
        className={`${classes.iconButtonAvatar} help-user-icon`}
        onClick={() => setOpen(true)}
        ref={anchorRef}
      >
        <Avatar src="/static/images/avatar/1.jpg" alt={initial} />
      </IconButton>
      <Menu
        open={open}
        keepMounted
        onClose={handleClose}
        anchorEl={anchorRef.current}
        getContentAnchorEl={null}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <MenuItem
          onClick={() => {
            setShowAbout(true);
            setOpen(false);
          }}
        >
          About Us
        </MenuItem>
        <MenuItem
          onClick={() => {
            dispatch({ type: "LOGOUT" });
          }}
        >
          Logout
        </MenuItem>
      </Menu>
      <Dialog
        open={showAbout}
        onClose={handleClose}
        scroll="paper"
        aria-labelledby="scroll-dialog-title"
        aria-describedby="scroll-dialog-description"
      >
        <DialogTitle id="scroll-dialog-title">About Grafluent</DialogTitle>
        <DialogContent dividers>
          <Typography variant="h6" gutterBottom>
            Background
          </Typography>
          <DialogContentText id="scroll-dialog-description" tabIndex={-1}>
            Data is no longer scarce in the digital age. Organisations now amass
            volumes of data from a variety of sources such as financial
            transactions, IoT devices, social media and online interactions. The
            ability to gather, process and derive insights from oceans of data
            has become critical for organisations in achieving their goals. For
            decades, organisations have been using Business Intelligence methods
            to slice and dice aggregated data to derive actionable insights.
          </DialogContentText>
          <DialogContentText id="scroll-dialog-description" tabIndex={-1}>
            Making sense of the world is easy when analysing structured data
            that is organised neatly into spreadsheets or database tables.
            However, how do you draw insights when your data are unstructured,
            disconnected, and rapidly evolving? How do you summarise data and
            draw connections when your inputs are hundreds of documents or
            thousands of emails?
          </DialogContentText>
          <img src={imgAim} style={{ width: "100%" }} />
          <Typography variant="h6" gutterBottom>
            Aims
          </Typography>
          <DialogContentText id="scroll-dialog-description" tabIndex={-1}>
            Our goal is to help our users make sense of large volumes of textual
            data. Grafluent is a data visualisation tool that allows users to
            explore a large network of entities and relationships extracted from
            a corpus of text. Users upload collections of text into the
            platform, which is then analysed through NLP techniques to extract
            named entities such as natural persons, organisations, and
            locations. Grafluent then analyses the text to determine how these
            entities are connected to each other. Once all the data has been
            processed, users will be able to explore all the named entities and
            their links through a graph-based user interface.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default connect((state) => ({
  username: state.app.username,
}))(withStyles(styles)(UserIcon));
