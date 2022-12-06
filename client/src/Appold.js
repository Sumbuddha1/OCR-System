import React, { Component } from 'react';
import defImg from './default.jpg'
import { Col, Container, Form, Row, Table, Image, Button, Navbar, ToggleButton, ToggleButtonGroup, Spinner } from 'react-bootstrap';
import './components/dashboard/bootstrap/dist/css/bootstrap.min.css';
import './mycss.css';
import { toast } from 'react-toastify';

const reader = new FileReader();

export class App extends Component {

  constructor(props) {
    super(props)
    this.editButton = this.editButton.bind(this);
    this.adminButton = this.adminButton.bind(this);
    this.state = {
      image: defImg,
      output: "",
      returnButton: true,
      editButton: false,
      admin: false,
      loading: false
    }
  }

  imageHandler = (e) => {
    reader.onload = () => {
      if (reader.readyState === 2) {
        this.setState({ image: reader.result })
      }
    }
    reader.readAsDataURL(e.target.files[0])
  };

  submitHandler = (event) => {
    event.preventDefault();
    var array = [];
    var checkboxes = document.querySelectorAll('input[type=checkbox]:checked');
    const fileInput = document.getElementById('input');
    fileInput.onchange = () => {
      const selectedFile = fileInput.files[0];
      console.log(selectedFile);
    }
    for (var i = 0; i < checkboxes.length; i++) {
      array.push(checkboxes[i].value);
    }
    console.log(array);
    var json_arr = JSON.stringify(array);
    var data = new FormData();
    // console.log(json_arr);
    data.append("image", fileInput.files[0]);
    data.append("options", json_arr);
    console.log(data)

    var requestOptions = {
      method: 'POST',
      body: data,
      redirect: 'follow'
    };
    this.setState({ loading: true }); //simple user feedback on submit
    this.setState({ returnButton: true }) //resets previous scan's output ui
    this.setState({ editButton: false })

    fetch("http://127.0.0.1:5000/api/post", requestOptions)
      .then(response => response.json())
      .then(result => {
        console.log(result)
        this.setState({ output: result })
        this.setState({ loading: false });
      })
    this.setState({loading: false});
  }

  createCustomer = async e => {// this will need to be redone due to all names being changed 
    // const [customers, setCustomers] = useState(false);
    try {
      const myHeaders = new Headers();

      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("jwt_token", localStorage.token);

      let filename = this.output.filename;
    let invoice_number = document.getElementById("invoicenumber").value;
    let vendor_name  = document.getElementById("vendor_name").value;
    let client_name = document.getElementById("name").value;
    let address = document.getElementById("address").value;
    let address_line_2 = document.getElementById("address2").value;
    let address_line_3 = document.getElementById("address3").value;
    let account_number = document.getElementById("accountnumber").value;
    let invoice_date = document.getElementById("invoicedate").value;
    let due_date = document.getElementById("duedate").value;
    let total_amount = document.getElementById("totalamount").value;
    let bpay_code = document.getElementById("bpaycode").value;
    let bpay_ref = document.getElementById("bpayreference").value;
    let eft_account_num = document.getElementById("eftnumber").value;
    let eft_account_name = document.getElementById("eftname").value;
    let eft_bsb = document.getElementById("eftbsb").value;
    let postbillpay_code = document.getElementById("postbillpaycode").value;
    let postbillpay_ref = document.getElementById("postbillpayref").value;
    const response = await fetch('http://localhost:3003/customers', {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify({
        filename,
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
        postbillpay_ref 
      }),
    });
    
    const parseResponse = await response.json();
    if (parseResponse) {
      toast.success("Information saved");
      window.location.reload(true);
    } else {
      toast.error("Information cannot be saved");
    }

    } catch (err) {
      console.error(err.message);
    }

    

  }

  editButton() {
    this.setState(state => ({
      editButton: !state.editButton
    }));
    this.setState(state => ({
      returnButton: !state.returnButton
    }));
  }
  adminButton() { //ideally swapped out for value coming from login screen
    this.setState(state => ({
      admin: !state.admin
    }));
  }
  /*
    inputClick = () => {
      const inputButton = React.useRef(null);
      inputButton.current.click()
    }

  optionClick = (e) => {
    var { name, checked } = e.target
    this.setState((e) => {
      var optionCheck = e.scanOptions;
      var fullOptions = Object.keys(this.state.scanOptions);
      console.log(fullOptions)
      return optionCheck[name] = checked;

    });
  }
  handleInputChange(event) {
    const target = event.target;
    var value = target.value;

    if (target.checked) {
      this.state.scanOptions[value] = value;
    }
    else {
      this.state.scanOptions.splice(value, 1);
    }

  } */
  submitHandler2() {//should work but couldn't get an endpoint working to receive
    var array = []
    var checkboxes = document.querySelectorAll('input[type=checkbox]:checked')

    for (var i = 0; i < checkboxes.length; i++) {
      array.push(checkboxes[i].value)
    }
    console.log(array)

    var data = new FormData();
    data.append("options", "array");

    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    xhr.addEventListener("readystatechange", function () {
      if (this.readyState === 4) {
        console.log(this.responseText);
      }
    });

    xhr.open("POST", "http://127.0.0.1:5000/api/scan");
    xhr.send(data);
    console.log(data)
  }


  /* this causes TypeError: Cannot set property 'onchange' of null
<Button>
                      <label for="inputButton">Select File</label>
                      <input type="file" name="image" id="inputButton" accept="image/*" style={{ display: 'none' }} onChange={this.imageHandler} />
                      </Button>{' '}
*/

  render() {
    const { image } = this.state
    const { output } = this.state
    const { editButton } = this.state
    const { returnButton } = this.state
    const { admin } = this.state
    const { loading } = this.state
    return (
      <div>
        <Container>
          <Navbar>
            <Navbar.Brand>OCR System</Navbar.Brand>
            <Navbar.Toggle />
            <Navbar.Collapse className="justify-content-end">
              <Button onClick={this.adminButton}>Admin</Button>
            </Navbar.Collapse>
          </Navbar>
          <Row>
            <Col></Col>
            <Col><h1>Upload Bill</h1></Col>
            <Col></Col>
          </Row>
          <Row>
            <Col sm={8}>
              <form encType="multipart/form-data">
                <Image className="imageMain" src={image} />
                <Row>
                  <Col>
                    <Button>
                      <input type="file" name="image" id="input" accept="image/*" onChange={this.imageHandler} />
                    </Button>{' '}
                    <Button onClick={this.submitHandler}>Upload</Button>
                  </Col>
                </Row>
              </form>
            </Col>
            <Col sm={4}>
              {loading && <div>
                <Spinner animation="border" role="status">
                </Spinner>
              </div>}
              {/* https://www.nicesnippets.com/blog/react-js-get-multiple-checkbox-value-on-submit */}
              {admin && <div>
                <p>Scan for</p>
                <Form>
                  <Form.Check
                    type={'checkbox'}
                    id={`invNum`}
                    label={`Invoice Number`}
                    value={'invoice_number'}
                  />
                  <Form.Check
                    type={'checkbox'}
                    id={`venNam`}
                    label={`Vendor Name`}
                    value={'vendor_name'}
                  />
                  <Form.Check
                    type={'checkbox'}
                    id={`cliNam`}
                    label={`Client Name`}
                    value={'client_name'}
                  />
                  <Form.Check
                    type={'checkbox'}
                    id={`add`}
                    label={`Address`}
                    value={'address'}
                  />
                  <Form.Check
                    type={'checkbox'}
                    id={`accNum`}
                    label={`Account Number`}
                    value={'account_number'}
                  />
                  <Form.Check
                    type={'checkbox'}
                    id={`addr_l2`}
                    label={'Address Line 2'}
                    value={'address_line_2'}
                  />
                  <Form.Check
                    type={'checkbox'}
                    id={`addr_l3`}
                    label={`Address Line 3`}
                    value={'address_line_3'}
                  />
                  <Form.Check
                    type={'checkbox'}
                    id={`bpaCode`}
                    label={`BPAY Code`}
                    value={'bpay_code'}
                  />
                  <Form.Check
                    type={'checkbox'}
                    id={`bpayRef`}
                    label={`BPAY Reference Number`}
                    value={'bpay_ref'}
                  />
                  <Form.Check
                    type={'checkbox'}
                    id={`eftAccountNum`}
                    label={`EFT Account Number`}
                    value={'eft_account_num'}
                  />
                  <Form.Check
                    type={'checkbox'}
                    id={`eftBSB`}
                    label={`EFT BSB`}
                    value={'eft_bsb'}
                  />
                  <Form.Check
                    type={'checkbox'}
                    id={`eftAccountName`}
                    label={`EFT Account Name`}
                    value={'eft_account_name'}
                  />
                  <Form.Check
                    type={'checkbox'}
                    id={`postbillpayCode`}
                    label={`Post Billpay Code`}
                    value={'postbillpay_code'}
                  />
                  <Form.Check
                    type={'checkbox'}
                    id={`postbillpayRef`}
                    label={`Post Billpay Reference Number`}
                    value={'postbillpay_ref'}
                  />
                  <Form.Check
                    type={'checkbox'}
                    id={`invoiceDate`}
                    label={`Invoice Date`}
                    value={'invoice_date'}
                  />
                  <Form.Check
                    type={'checkbox'}
                    id={`dueDat`}
                    label={`Due Date`}
                    value={'due_date'}
                  />
                  <Form.Check
                    type={'checkbox'}
                    id={`totAmm`}
                    label={`Total Amount`}
                    value={'total_amount'}
                  />
                </Form>
                <br></br>
                <Button onClick={this.submitHandler2}>Option upload</Button>
              </div>}

              {returnButton && output && <div>
                <p>Scan Results</p>
                <Table borderless>
                  <tr>
                    <p><td>Invoice Number: </td>
                      <td>{output.invoice_number}</td></p>
                  </tr>
                  <tr>
                    <p><td>Vendor: </td>
                      <td>{output.vendor_name}</td></p>
                  </tr>
                  <tr>
                    <p><td>Name: </td>
                      <td>{output.client_name}</td></p>
                  </tr>
                  <tr>
                    <p><td>Address: </td>
                      <td>{output.address}</td></p>
                  </tr>
                  {output.address_line_2 !== "" && <tr>
                    <p><td>Address Line 2: </td>
                      <td>{output.address_line_2}</td></p>
                  </tr>}
                  {(output.address_line_3 !== "") && <tr>
                    <p><td>Address Line 3: </td>
                      <td>{output.address_line_3}</td></p>
                  </tr>}
                  <tr>
                    <p><td>Account Number: </td>
                      <td>{output.account_number}</td></p>
                  </tr>
                  <tr>
                    <p><td>Invoice Date: </td>
                      <td>{output.invoice_date}</td></p>
                  </tr>
                  <tr>
                    <p><td>Due Date: </td>
                      <td>{output.due_date}</td></p>
                  </tr>
                  <tr>
                    <p><td>Total Amount: </td>
                      <td>{output.total_amount}</td></p>
                  </tr>
                  {(output.bpay_code !== "" || output.bpay_ref !== "" ) && <div>
                    <tr>
                      <p><td>BPAY Code: </td>
                        <td>{output.bpay_code}</td></p>
                    </tr>
                    <tr>
                      <p><td>BPAY Reference Number: </td>
                        <td>{output.bpay_ref}</td></p>
                    </tr>
                  </div>}
                  {(output.eft_account_num !== "" || output.eft_account_name !== "" || output.eft_bsb !== "" ) && <div><tr>
                    <p><td>Eftpos Account Number: </td>
                      <td>{output.eft_account_num}</td></p>
                  </tr>
                    <tr>
                      <p><td>Eftpos Account Name: </td>
                        <td>{output.eft_account_name}</td></p>
                    </tr>
                    <tr>
                      <p><td>Eftpos BSB: </td>
                        <td>{output.eft_bsb}</td></p>
                    </tr>
                  </div>}
                  {(output.postbillpay_code !== "" || output.postbillpay_ref!== "" ) && <div><tr>
                    <p><td>Post Billpay Code: </td>
                      <td>{output.postbillpay_code}</td></p>
                  </tr>
                    <tr>
                      <p><td>Post Billpay Reference Number: </td>
                        <td>{output.postbillpay_ref}</td></p>
                    </tr>
                  </div>}
                </Table>
                <Button onClick={this.editButton}>Edit</Button>{' '}
                <Button variant="primary" type="submit" onClick={this.createCustomer}>Save</Button>
              </div>}

              {editButton && <div>
                <p>User correction</p>
                <Form>
                  <Form.Group controlId="invoicenumber">
                    <Form.Label>Invoice Number</Form.Label>
                    <Form.Control type="text" Value={output.invoice_number} />
                  </Form.Group>
                  <br></br>
                  <Form.Group controlId="vendorname">
                    <Form.Label>Vendor Name</Form.Label>
                    <Form.Control type="text" Value={output.vendor_name} />
                  </Form.Group>
                  <br></br>
                  <Form.Group controlId="name">
                    <Form.Label>Name</Form.Label>
                    <Form.Control type="text" Value={output.client_name} />
                  </Form.Group>
                  <br></br>
                  <Form.Group controlId="address">
                    <Form.Label>Address</Form.Label>
                    <Form.Control type="text" Value={output.address} />
                  </Form.Group>
                  {output.address_line_2 && <Form.Group controlId="address2">
                    <Form.Label>Address Line 2</Form.Label>
                    <Form.Control type="text" Value={output.address_line_2} />
                  </Form.Group>}
                  {output.address_line_3 && <Form.Group controlId="address3">
                    <Form.Label>Address Line 3</Form.Label>
                    <Form.Control type="text" Value={output.address_line_3} />
                  </Form.Group>}
                  <br></br>
                  <Form.Group controlId="accountnumber">
                    <Form.Label>Account Number</Form.Label>
                    <Form.Control type="text" Value={output.account_number} />
                  </Form.Group>
                  <br></br>
                  <Form.Group controlId="invoicedate">
                    <Form.Label>Invoice Date</Form.Label>
                    <Form.Control type="text" Value={output.invoice_date} />
                  </Form.Group>
                  <br></br>
                  <Form.Group controlId="duedate">
                    <Form.Label>Due Date</Form.Label>
                    <Form.Control type="text" Value={output.due_date} />
                  </Form.Group>
                  <br></br>
                  <Form.Group controlId="totalamount">
                    <Form.Label>Total Amount</Form.Label>
                    <Form.Control type="text" Value={output.total_amount} />
                  </Form.Group>
                  <br></br>
                  {output.bpay_code && <div>
                    <Form.Group controlId="bpaycode">
                      <Form.Label>BPAY Code</Form.Label>
                      <Form.Control type="text" Value={output.bpay_code} />
                    </Form.Group>
                    <br></br>
                    <Form.Group controlId="bpayreference">
                      <Form.Label>BPAY Reference Number</Form.Label>
                      <Form.Control type="text" Value={output.bpay_ref} />
                    </Form.Group>
                  </div>}
                  {output.eft_account_num && <div>
                    <Form.Group controlId="eftnumber">
                      <Form.Label>Eftpos Account Number</Form.Label>
                      <Form.Control type="text" Value={output.eft_account_num} />
                    </Form.Group>
                    <br></br>
                    <Form.Group controlId="eftname">
                      <Form.Label>Eftpos Account Name</Form.Label>
                      <Form.Control type="text" Value={output.eft_account_name} />
                    </Form.Group>
                    <br></br>
                    <Form.Group controlId="eftbsb">
                      <Form.Label>Eftpos BSB</Form.Label>
                      <Form.Control type="text" Value={output.eft_bsb} />
                    </Form.Group>
                  </div>}
                  {output.postbillpay_code && <div>
                    <Form.Group controlId="postbillpaycode">
                      <Form.Label>Post Billpay Code</Form.Label>
                      <Form.Control type="text" Value={output.postbillpay_code} />
                    </Form.Group>
                    <br></br>
                    <Form.Group controlId="postbillpayref">
                      <Form.Label>Post Billpay Reference Number</Form.Label>
                      <Form.Control type="text" Value={output.postbillpay_ref} />
                    </Form.Group>
                  </div>}
                  <br></br>
                  <Button onClick={this.editButton}>Return</Button>{' '}
                  <Button variant="primary" type="submit" onClick={this.createCustomer}>Save</Button>
                </Form>
              </div>}

            </Col>
          </Row>
        </Container>
      </div>

    );

  }
}

/*<Form>

      <Table>
                  <tr>
                    <td>Name: </td>
                    <td><input type="text" id="name" name="name" Value={output.name} /></td>
                    <span id="name-error" style={{ display: 'none' }}>either name is empty or invalid format</span><br /><br />
                  </tr>
                  <tr>
                    <td>Address: </td>
                    <td><input type="text" name="address" id="address" Value={output.address} /></td>
                    <span id="address-error" style={{ display: 'none' }}>either address is empty or invalid format</span><br /><br />
                  </tr>
                  <tr>
                    <td>Account Number: </td>
                    <td><input type="text" name="account" id="account" Value={output.accountnumber} /></td>
                    <span id="account-error" style={{ display: 'none' }}>either account number is empty or invalid format</span><br /><br />
                  </tr>
                  <tr>
                    <td>Total Amount Due: </td>
                    <td><input type="text" name="amount" id="amount" Value={output.totalamount} /></td>
                    <span id="amount-error" style={{ display: 'none' }}>either amount due is empty or invalid format</span><br /><br />
                  </tr>
                </Table>


                <Form.Group controlId="name">
                  <Form.Label>Name</Form.Label>
                  <Form.Control type="text" Value="oName"/>
                </Form.Group>
                <Form.Group controlId="address">
                  <Form.Label>Address</Form.Label>
                  <Form.Control type="text"/>
                </Form.Group>
                <Form.Group controlId="account">
                  <Form.Label>Account Number</Form.Label>
                  <Form.Control type="text"/>
                </Form.Group>
                <Form.Group controlId="amount">
                  <Form.Label>Total Ammount Due</Form.Label>
                  <Form.Control type="text"/>
                </Form.Group>
              </Form>
              <Button variant="primary" type="submit">
            Submit
            </Button> 
            
            
            <button onClick={this.submitHandler}>Upload</button>
            */

export default App;