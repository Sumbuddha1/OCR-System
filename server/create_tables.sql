CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE logins(
    user_id UUID DEFAULT uuid_generate_v4(),
    user_name VARCHAR(255) NOT NULL,
    user_username VARCHAR(255) NOT NULL UNIQUE,
    user_password VARCHAR(255) NOT NULL,
    PRIMARY KEY (user_id)
);

CREATE TABLE extracted_information(
    customer_id SERIAL PRIMARY KEY,
    user_id UUID,
    client_name VARCHAR(255),
    address VARCHAR(255),
    total_amount VARCHAR(255),
    account_number VARCHAR(255),
    address_line_2 VARCHAR(255),
    address_line_3 VARCHAR(255),
    invoice_number VARCHAR(255),
    vendor_name VARCHAR(255),
    bpay_code VARCHAR(255),
    bpay_ref VARCHAR(255),
    eft_account_num VARCHAR(255),
    eft_account_name VARCHAR(255),
    eft_bsb VARCHAR(255),
    postbillpay_code VARCHAR(255),
    postbillpay_ref VARCHAR(255),
    invoice_date VARCHAR(255),
    due_date VARCHAR(255),
    filename VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES logins(user_id)
);