import React, { Fragment, useState } from "react";
import { Link } from "react-router-dom";

import { toast } from "react-toastify";
/*
* Codes of login page
* only logins if setAuth returns true
* Reference from https://github.com/AndrewJBateman/pern-stack-auth/blob/master/client/src/components/Login.js
*/
const Login = ({ setAuth }) => {
  const [inputs, setInputs] = useState({
    username: "",
    password: ""
  });

  const { username, password } = inputs;

  const style = { //buttons style
    backgroundColor: "#1890ff",
    borderColor: "#1890ff"
  };

  const onChange = e =>
    setInputs({ ...inputs, [e.target.name]: e.target.value });

  const onSubmitForm = async e => {
    e.preventDefault();
    try {
      const body = { username, password };
      const response = await fetch(
        "http://localhost:3003/authentication/login",
        {
          method: "POST",
          headers: {
            "Content-type": "application/json"
          },
          body: JSON.stringify(body)
        }
      );

      const parseRes = await response.json();

      if (parseRes.jwtToken) {
        localStorage.setItem("token", parseRes.jwtToken);
        setAuth(true);
        toast.success("Logged in Successfully");
      } else {
        setAuth(false);
        toast.error(parseRes);
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  return (
    <Fragment>
      <h1 className="mt-5 text-center">Login</h1>
      <form onSubmit={onSubmitForm}>
        <input
          type="text"
          name="username"
          value={username}
          placeholder="Username"
          onChange={e => onChange(e)}
          className="form-control my-3"
        />
        <input
          type="password"
          name="password"
          value={password}
          placeholder="Password"
          onChange={e => onChange(e)}
          className="form-control my-3"
        />  
        <button className="btn btn-primary w-100" style={style}>Login</button>
      </form>
      <hr/>
      <Link to="/register" className="btn btn-primary w-100" style={style}>Register</Link>
    </Fragment>
  );
};

export default Login;