module.exports = function (req, res, next) {
  const { username, name, password } = req.body;

  /*
  * https://github.com/AndrewJBateman/pern-stack-auth/blob/master/server/middleware/validInfo.js
  */

  // check a valid username has been entered by using a regex function
  
  if (req.path === "/register") {
    if (![username, name, password].every(Boolean)) {//if any of the field is empty
      return res.json("Missing Credentials");
    } 
  } else if (req.path === "/login") {
    if (![username, password].every(Boolean)) {//if any of the field is empty
      return res.json("Missing Credentials");
    }
  }

  next();
};
