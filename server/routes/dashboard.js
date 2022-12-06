const router = require("express").Router();
const authorize = require("../middleware/authorize");
const pool = require("../db");


router.get("/", authorize, async (req, res) => {//gets information only related with logged in user
  try {
    const user = await pool.query(
      "SELECT u.user_name, u.user_username, t.customer_id, t.client_name, t.address, t.total_amount, t.account_number, t.address_line_2, t.address_line_3, t.invoice_number, t.vendor_name, t.bpay_code, t.bpay_ref, t.eft_account_num, t.eft_account_name, t.eft_bsb, t.postbillpay_code, t.postbillpay_ref, t.invoice_date, t.due_date FROM logins AS u LEFT JOIN extracted_information AS t ON u.user_id = t.user_id WHERE u.user_id = $1",
      [req.user.id]
    );

    res.json(user.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

router.get("/extractall", authorize, async (req, res) => {//gets all the information from extracted information table including the user information who saved the information
  try {

    const user = await pool.query(
      "SELECT u.user_name, u.user_username, t.client_name, t.address, t.total_amount, t.account_number,t.address_line_2,t.address_line_3,t.invoice_number,t.vendor_name,t.bpay_code,t.bpay_ref,t.eft_account_name,t.eft_bsb,t.eft_account_num,t.postbillpay_code,t.postbillpay_ref,t.invoice_date,t.due_date,t.filename FROM logins AS u LEFT JOIN extracted_information AS t ON u.user_id = t.user_id",
    );

    res.json(user.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

router.get("/totalinvoices", authorize, async (req, res) => {//queries the saved total invoices in database
  try {

    const user = await pool.query(
      "SELECT COUNT(filename) FROM extracted_information;",
    );

    res.json(user.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

router.get("/totalusers", authorize, async (req, res) => {//queries the total user who can login to system
    try {
    const user = await pool.query(
      "SELECT COUNT(user_id) FROM logins;",
    );

    res.json(user.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

router.post("/customers", authorize, async (req, res) => {//query that saves all the extracted information including the filename and path to the database.
  
  try {
    const { filename,
      invoice_number,
      vendor_name,
      client_name,
      address,
      address_line_2,
      address_line_3,
      account_number,
      invoice_date,
      due_date,
      total_amount,
      bpay_code,
      bpay_ref,
      eft_account_num,
      eft_account_name,
      eft_bsb,
      postbillpay_code,
      postbillpay_ref  } = req.body;//information passed through user Interface
    const newdetail = await pool.query(
      "INSERT INTO extracted_information (user_id, client_name, address, total_amount, account_number, address_line_2, address_line_3, invoice_number, vendor_name, bpay_code, bpay_ref, eft_account_num, eft_account_name, eft_bsb, postbillpay_code, invoice_date, due_date, filename, postbillpay_ref) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19) RETURNING *",
      [req.user.id, client_name, address, total_amount, account_number, address_line_2, address_line_3, invoice_number, vendor_name, bpay_code, bpay_ref, eft_account_num, eft_account_name, eft_bsb, postbillpay_code, invoice_date, due_date, filename,postbillpay_ref]
    );
    res.json(newdetail.rows[0]);
    
  } catch (err) {
    console.error(err.message);
  }
});

module.exports = router;
