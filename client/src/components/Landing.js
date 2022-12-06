import React from "react";
import { Link } from "react-router-dom";
import './jumbo.css';

/*
* Codes of OCR home page on react url '/' only path
*/
const Landing = () => {

  const style = {
    backgroundColor: "#1890ff",
    borderColor: "#1890ff"
  };
  return (
    <div class="jumbotron">
      <h1>Welcome to OCR Application</h1>
      <p>Sign in to start scanning bills </p>
      <Link to="/login" className="btn btn-primary ml-5" type="button">
        Login
      </Link>
      <Link to="/register" className="btn btn-primary gap" type="button">
        Register
      </Link>
      </div>
  );
};

export default Landing;
