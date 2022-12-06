require('dotenv').config();

const Pool = require("pg").Pool;

const pool = new Pool({
  user: "andrew",
  password: "andrew",
  host: "localhost",
  port: 5432,
  database: "ocr_database"
});

module.exports = pool;
