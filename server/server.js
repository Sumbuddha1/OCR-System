const express = require("express");
const app = express();
const cors = require("cors");

app.use(cors());
app.use(express.json());


//routes
app.use("/authentication", require("./routes/jwtAuth"));
app.use("/dashboard", require("./routes/dashboard"));

app.listen(3003, () => {//port listens 
  console.log(`Server is starting on port 3003`);
});
