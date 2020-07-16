import React from "react";
import Avatar from "@material-ui/core/Avatar";
import AddIcon from "@material-ui/icons/Add";
import FaceIcon from "@material-ui/icons/Face";
import GroupIcon from "@material-ui/icons/Group";
import PlaceIcon from "@material-ui/icons/Place";
import EmojiSymbolsIcon from "@material-ui/icons/EmojiSymbols";
import { makeStyles } from "@material-ui/core/styles";
import { green, pink, deepOrange, deepPurple } from "@material-ui/core/colors";

import "./node.css";

const useStyles = makeStyles((theme) => ({
  pink: {
    color: theme.palette.getContrastText(pink[500]),
    backgroundColor: pink[500],
  },
  green: {
    color: "#fff",
    backgroundColor: green[500],
  },
  orange: {
    color: theme.palette.getContrastText(deepOrange[500]),
    backgroundColor: deepOrange[500],
  },
  purple: {
    color: theme.palette.getContrastText(deepPurple[500]),
    backgroundColor: deepPurple[500],
  },
}));

function getColor(kind, classes) {
  switch (kind) {
    case "PERSON":
      return classes.green;
    case "ORGANIZATION":
      return classes.purple;
    case "LOCATION":
      return classes.orange;
    case "MISC":
      return classes.pink;
    default:
      return "";
  }
}

function Node({ entity }) {
  const classes = useStyles();
  const { image, kind } = entity;
  const size = ~~(entity.size / 10);

  return (
    <>
      <Avatar
        style={{ width: size, height: size }}
        src={
          image
            ? `https://images.weserv.nl/?mask=circle&w=250&h=250&fit=cover&url=ssl:${image}`
            : undefined
        }
        className={
          kind === "SYSTEM_EXPAND"
            ? `animate-flicker ${classes.pink}`
            : getColor(kind, classes)
        }
      >
        {!image && kind === "SYSTEM_EXPAND" ? <AddIcon /> : null}
        {!image && kind === "PERSON" ? <FaceIcon /> : null}
        {!image && kind === "ORGANIZATION" ? <GroupIcon /> : null}
        {!image && kind === "LOCATION" ? <PlaceIcon /> : null}
        {!image && kind === "MISC" ? <EmojiSymbolsIcon /> : null}
      </Avatar>
    </>
  );
}

export default Node;
