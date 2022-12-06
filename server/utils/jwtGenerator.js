const jwt = require("jsonwebtoken");
require("dotenv").config();

/*
* function that generates the jason web token through the id of the user as payload
* Reference from https://github.com/AndrewJBateman/pern-stack-auth/blob/master/server/utils/jwtGenerator.js
*/
function jwtGenerator(user_id) {
  const payload = {
    user: {
      id: user_id
    }
  };

  return jwt.sign(payload, "secret", { expiresIn: "1h" });
}

module.exports = jwtGenerator;
