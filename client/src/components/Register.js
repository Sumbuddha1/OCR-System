import React, { Fragment, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const style = {//button style
  backgroundColor: "#1890ff",
  borderColor: "#1890ff"
};

/*
* Code that extecute registration page
* Has to fill the required fields
* if username is unique and password and name is provided then user gets directly logged in 
* Reference from https://github.com/AndrewJBateman/pern-stack-auth/blob/master/client/src/components/Register.js
*/
const Register = ({ setAuth }) => {
  const [inputs, setInputs] = useState({
    username: "",
    password: "",
    name: ""
  });

  const { username, password, name } = inputs;

  const onChange = e =>
    setInputs({ ...inputs, [e.target.name]: e.target.value });

  const onSubmitForm = async e => {
    e.preventDefault();
    try {
      const body = { username, password, name };
      const response = await fetch(
        "http://localhost:3003/authentication/register",
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
        toast.success("Registered Successfully");
      } else {
        setAuth(false);
        toast.error('parseRes error: ', parseRes);
      }
    } catch (err) {
      console.error('onSubmit form error: ', err.message);
    }
  };

  return (
    <Fragment>
      <h1 className="mt-5 text-center">Register</h1>
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
        <input
          type="text"
          name="name"
          value={name}
          placeholder="Name"
          onChange={e => onChange(e)}
          className="form-control my-3"
        />
        <button className="btn btn-primary w-100" style={style}>Submit</button>
      </form>
      <Link to="/login">login</Link>
    </Fragment>
  );
};

export default Register;
