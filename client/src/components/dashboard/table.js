import React, { Fragment, useState, useEffect } from "react";
import "./table.css";

/*
* code that contains the table of the field of extracted informations.
* this function is called in viewextract.js file where get function is executed
*/
const ListCustomer = ({ allDatas }) => {
  const [datas, setDatas] = useState([]); //data array that contains information for each fields.  
  const [number, setNumber] = useState(1);

  useEffect(() => {
    setDatas(allDatas);
  }, [allDatas]);
 

  return (
    <Fragment>

      <table className="table mt-5">
        <thead>
          <tr>
            <th>System user</th>
            <th>Invoice Number</th>
            <th>Company Name</th>
            <th>Client Name</th>
            <th>Address</th>
            <th>Address Line 2</th>
            <th>Address Line 3</th>
            <th>Account Number</th>
            <th>BPAY Code</th>
            <th>BPAY Reference Number</th>
            <th>EFT Account Number</th>
            <th>EFT BSB</th>
            <th>EFT Account Name</th>
            <th>Post Billpay Code</th>
            <th>Post Billpay Reference Number</th>
            <th>Invoice Date</th>
            <th>Due Date</th>
            <th>Total Amount</th>


          </tr>
        </thead>
        <tbody>

          {datas.length !== 0 &&
            datas[0].customer_id !== null &&
            datas.map(data => (
              <tr key={data.customer_id}>
                 <td>{data.user_name}</td> 
                <td>{data.invoice_number}</td>
                <td>{data.vendor_name}</td>
                <td>{data.client_name}</td>
                <td>{data.address}</td>
                <td>{data.address_line_2}</td>
                <td>{data.address_line_3}</td>
                <td>{data.account_number}</td>
                <td>{data.bpay_code}</td>
                <td>{data.bpay_ref}</td>
                <td>{data.eft_account_num}</td>
                <td>{data.eft_bsb}</td>
                <td>{data.eft_account_name}</td>
                <td>{data.postbillpay_code}</td>
                <td>{data.postbillpay_ref}</td>
                <td>{data.invoice_date}</td>
                <td>{data.due_date}</td>
                <td>{data.total_amount}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </Fragment>
  );
};

export default ListCustomer;
