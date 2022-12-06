import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
//components

/*
* Code for page that only gets redirected when user try to register a new account
* Terms and conditions is displayed in the page and user has to agree to continue to main system page
*/
const Dashboard = ({ setAuth }) => {

  const [name, setName] = useState("");

  const getProfile = async () => {
    try {
      const res = await fetch("http://localhost:3003/dashboard/", {
        method: "GET",
        headers: { jwt_token: localStorage.token },
      });

      const parseData = await res.json();

      setName(parseData[0].user_name); // name is the first array item
    } catch (err) {
      console.error(err.message);
    }
  };

  const logout = async (e) => {
    e.preventDefault();
    try {
      localStorage.removeItem("token");
      setAuth(false);
      toast.success("Successfully logged out");
    } catch (err) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    getProfile();

  });


  const [checked, setChecked] = useState(false);


  return (
    <div>
      <div className="d-flex mt-5 justify-content-around">
        <h2>Welcome {name} to BILLI's OCR System</h2>
        <button onClick={(e) => logout(e)} className="btn btn-primary">
          Logout
        </button>
      </div><hr /><hr />
      <h3> Terms and conditions</h3><hr />
      <ul>
        <li>By accepting below, you accept that personal information may be provided to BILLI</li>
      </ul><hr /><hr />
      <input type="checkbox" id="agree" name="agree" value={checked} onChange={() => setChecked((checked) => !checked)}
      />
      <label for="agree">Please check the box to agree and continue</label><hr />
      {checked ? <Link to="/ocr" className="btn btn-primary ml-3">
        Continue
        </Link> : ""}


    </div>
  );
};

export default Dashboard;