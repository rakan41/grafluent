import React, { Component } from "react";
import "./header.css";
import { Link } from "react-router-dom";

class LoginHeader extends Component {
  state = {};
  render() {
    return (
      <div className="header">
        <a href="/" className="logo">
          GRAFLUENT
        </a>
        <div className="header-right">
          <Link to="/login" className="logo">
            Login
          </Link>
          <Link to="/register" className="logo">
            Sign up
          </Link>
        </div>
      </div>
    );
  }
}

export default LoginHeader;
