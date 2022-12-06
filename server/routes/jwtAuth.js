const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const pool = require("../db");
const validInfo = require("../middleware/validInfo");
const jwtGenerator = require("../utils/jwtGenerator");
const authorize = require("../middleware/authorize");

/*
* Referenced from https://github.com/AndrewJBateman/pern-stack-auth/blob/master/server/routes/jwtAuth.js
*/

router.post("/register", validInfo, async (req, res) => {
  const { username, name, password } = req.body;//gets information from user interface

  try {//to check if the user with same username already exists or not
    const user = await pool.query("SELECT * FROM logins WHERE user_username = $1", [
     username
    ]);

    if (user.rows.length > 0) {
      return res.status(401).json("User already exist!");//display error if exists 
    }

    const salt = await bcrypt.genSalt(10);
    const bcryptPassword = await bcrypt.hash(password, salt);//encrypted password by adding salt

    let newUser = await pool.query(//if unique username is provided then provided information inserts into the table
      "INSERT INTO logins (user_name, user_username, user_password) VALUES ($1, $2, $3) RETURNING *",
      [name, username, bcryptPassword]
    );

    const jwtToken = jwtGenerator(newUser.rows[0].user_id);

    return res.json({ jwtToken });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

router.post("/login", validInfo, async (req, res) => {//to verify if the provided login information is correct or not
  const { username, password } = req.body; //gets from user interface

  try {
    const user = await pool.query("SELECT * FROM logins WHERE user_username = $1", [ //query that checks the database
      username
    ]);

    if (user.rows.length === 0) {
      return res.status(401).json("Invalid Credential");//if doesnot match
    }

    const validPassword = await bcrypt.compare( //to check if the provided password is correct or not
      password,
      user.rows[0].user_password
    );

    if (!validPassword) {
      return res.status(401).json("Invalid Credential");
    }
    const jwtToken = jwtGenerator(user.rows[0].user_id);
    return res.json({ jwtToken });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

router.post("/verify", authorize, (req, res) => {
  try {
    res.json(true);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;