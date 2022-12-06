import React, { Component, useState } from 'react';
import defImg from './default.jpg'
import { Col, Container, Form, Row, Table, Image, Button, Navbar, ToggleButton, ToggleButtonGroup, Spinner, Nav } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap'
import './bootstrap/dist/css/bootstrap.min.css';
import './mycss.css';
import { toast } from 'react-toastify';
import NavBar from './navbar'//even though it has been defined it didn't get used at the end. 

const reader = new FileReader();

/*
* this is the code for the systems main page
* multiple functions has been called inside for each functionalities
* code has both admins and users authorizations
*/
const OCR = ({ setAuth }) => {//user has to be authenticated
    const logout = async (e) => {//to set authencation to false and log user out
        e.preventDefault();
        try {
            localStorage.removeItem("token");
            setAuth(false);
            toast.success("Successfully logged out");
        } catch (err) {
            console.error(err.message);
        }

    };

    const style = {//button styles
        backgroundColor: "#1890ff",
        borderColor: "#1890ff"
    };
    const [name, setName] = useState("");//to display name of logged in user
    const [user, setUser] = useState("");//for the authorization purpose

    const getUser = async () => {//gets informations from port 3003
        try {
            const res = await fetch("http://localhost:3003/dashboard/", {
                method: "GET",
                headers: { jwt_token: localStorage.token }
            });
            const parseData = await res.json();

            setName(parseData[0].user_name);
            setUser(parseData[0].user_username);
            
        } catch (err) {
            console.error(err.message);
        }
    };
    
    class App extends Component {

        constructor(props) {//initial states of all the components
            super(props)
            this.toggleButton = this.toggleButton.bind(this);
            this.optionButton = this.optionButton.bind(this);
            this.editButton = this.editButton.bind(this);
            this.adminButton = this.adminButton.bind(this);
            this.trainButton = this.trainButton.bind(this);
            this.fileInput = React.createRef();
            this.state = {
                image: defImg,
                output: "",
                editToggle: true,
                admin: false, //this value determines if admin functionality is shown or not
                scanOp: false,
                loading: false,
                invoice_number: "",
                vendor_name: "",
                client_name: "",
                address: "",
                address_line_2: "",
                address_line_3: "",
                account_number: "",
                invoice_date: "",
                due_date: "",
                total_amount: "",
                bpay_code: "",
                bpay_ref: "",
                eft_account_num: "",
                eft_account_name: "",
                eft_bsb: "",
                postbillpay_code: "",
                postbillpay_ref: ""
            }
            getUser();
            console.log({user});
            if (user == "admin1") {//if logged in account is admins.
                this.state.admin = true
            }
            console.log({name})
        }

        /*
        * Handles the selection of the file 
        * if file is not selected displays alert
        * if selected file pdf displays alert
        */
        imageHandler = (e) => {
            try {//referenced from https://github.com/MeRahulAhire/react-image-preview-tutorial/blob/master/src/App.js
                var fileName = this.fileInput.current.files[0].name
                var ext = fileName.split('.').pop();
                if (ext == "pdf") {
                    //pdf preview here, for now just resets existing image and posts an alert
                    reader.onload = () => {
                        if (reader.readyState === 2) {
                            this.setState({ image: defImg })
                        }
                    }
                    reader.readAsDataURL(e.target.files[0])
                    toast.error("PDF Preview is not supported");
                }
                else {
                    reader.onload = () => {
                        if (reader.readyState === 2) {
                            this.setState({ image: reader.result })
                        }
                    }
                    reader.readAsDataURL(e.target.files[0])
                }
            } catch (err) {
                toast.error("Error: No file selected");
                console.log(err.message);
            }

        };

        /*
        * funciton that posts the selected file to python api
        * on follow it receives the extracted results and changes the state values of fields 
        */
        submitHandler = (event) => {//referenced from Postman 
            event.preventDefault();
            var array = [];
            var checkboxes = document.querySelectorAll('input[type=checkbox]:checked');

            const { scanOp } = this.state;

            if (scanOp) {
                this.setState({ scanOp: false })
            }

            const fileInput = document.getElementById('input');
            fileInput.onchange = () => {
                const selectedFile = fileInput.files[0];
                console.log(selectedFile);
            }

            var data = new FormData();

            data.append("image", fileInput.files[0]);

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
                    this.setState({ output: result });
                    this.setState({ loading: false });
                    if (result.invoice_number) {//to check if the result of particular field is there or not
                        this.setState({ invoice_number: result.invoice_number[0] });
                    } else {
                        this.setState({ invoice_number: "" });
                    }

                    if (result.vendor_name) {
                        this.setState({ vendor_name: result.vendor_name[0] });
                    } else {
                        this.setState({ vendor_name: "" });
                    }

                    if (result.client_name) {
                        this.setState({ client_name: result.client_name[0] });
                    } else {
                        this.setState({ client_name: "" });
                    }

                    if (result.address) {
                        this.setState({ address: result.address[0] });
                    } else {
                        this.setState({ address: "" });
                    }

                    if (result.address_line_2) {
                        this.setState({ address_line_2: result.address_line_2[0] });
                    } else {
                        this.setState({ address_line_2: "" });
                    }

                    if (result.address_line_2) {
                        this.setState({ address_line_2: result.address_line_2[0] });
                    } else {
                        this.setState({ address_line_2: "" });
                    }

                    if (result.address_line_3) {
                        this.setState({ address_line_3: result.address_line_3[0] });
                    } else {
                        this.setState({ address_line_3: "" });
                    }

                    if (result.account_number) {
                        this.setState({ account_number: result.account_number[0] });
                    } else {
                        this.setState({ account_number: "" });
                    }

                    if (result.invoice_date) {
                        this.setState({ invoice_date: result.invoice_date[0] });
                    } else {
                        this.setState({ invoice_date: "" });
                    }

                    if (result.due_date) {
                        this.setState({ due_date: result.due_date[0] });
                    } else {
                        this.setState({ due_date: "" });
                    }

                    if (result.total_amount) {
                        this.setState({ total_amount: result.total_amount[0] });
                    } else {
                        this.setState({ total_amount: "" });
                    }

                    if (result.bpay_code) {
                        this.setState({ bpay_code: result.bpay_code[0] });
                    } else {
                        this.setState({ bpay_code: "" });
                    }

                    if (result.bpay_ref) {
                        this.setState({ bpay_ref: result.bpay_ref[0] });
                    } else {
                        this.setState({ bpay_ref: "" });
                    }

                    if (result.eft_account_num) {
                        this.setState({ eft_account_num: result.eft_account_num[0] });
                    } else {
                        this.setState({ eft_account_num: "" });
                    }

                    if (result.eft_account_name) {
                        this.setState({ eft_account_name: result.eft_account_name[0] });
                    } else {
                        this.setState({ eft_account_name: "" });
                    }

                    if (result.eft_bsb) {
                        this.setState({ eft_bsb: result.eft_bsb[0] });
                    } else {
                        this.setState({ eft_bsb: "" });
                    }

                    if (result.postbillpay_code) {
                        this.setState({ postbillpay_code: result.postbillpay_code[0] });
                    } else {
                        this.setState({ postbillpay_code: "" });
                    }

                    if (result.postbillpay_ref) {
                        this.setState({ postbillpay_ref: result.postbillpay_ref[0] });
                    } else {
                        this.setState({ postbillpay_ref: "" });
                    }
                });
        }

        /*
        * function that posts the scanned extracted results and possibily editied fields to node api 
        */
        createCustomer = async e => {
            e.preventDefault()
            try {
                const myHeaders = new Headers();
                const { output } = this.state
                const { invoice_number } = this.state
                const { vendor_name } = this.state
                const { client_name } = this.state
                const { address } = this.state
                const { address_line_2 } = this.state
                const { address_line_3 } = this.state
                const { account_number } = this.state
                const { invoice_date } = this.state
                const { due_date } = this.state
                const { total_amount } = this.state
                const { bpay_code } = this.state
                const { bpay_ref } = this.state
                const { eft_account_num } = this.state
                const { eft_account_name } = this.state
                const { eft_bsb } = this.state
                const { postbillpay_code } = this.state
                const { postbillpay_ref } = this.state

                myHeaders.append("Content-Type", "application/json");
                myHeaders.append("jwt_token", localStorage.token);

                let filename = output.filename;
                console.log(vendor_name)

                const response = await fetch('http://localhost:3003/dashboard/customers', {
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
                    // window.location.reload(true);
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

        toggleButton() {
            this.setState(state => ({
                editToggle: !state.editToggle
            }));
        }
        optionButton() { //ideally swapped out for value coming from login screen
            this.setState(state => ({
                scanOp: !state.scanOp
            }));
        }

        /*
        * function for the training button funcionalities 
        * Iniciates the training of the ocr system
        */
        trainButton() {
            this.setState({ loading: true });
            var requestOptions = {
                method: 'POST',
                body: "Aaaa",
                redirect: 'follow'
            };
            try {
                fetch("http://127.0.0.1:5000/api/train", requestOptions)
                    .then(response => {
                        toast.success("Training success")
                        this.setState({ loading: false });
                    }
                    )
            } catch (err) {
                toast.error("Error while training");
                console.log(err.message);
                this.setState({ loading: false });
            }

        }

        // Sends the selected checkbox options to the Python program
        submitHandler2() {
            var array = []
            var checkboxes = document.querySelectorAll('input[type=checkbox]:checked')

            for (var i = 0; i < checkboxes.length; i++) {
                array.push(checkboxes[i].value)
            }
            console.log(array)
            var json_arr = JSON.stringify(array);
            var data = new FormData();
            data.append("options", json_arr);

            var requestOptions = {
                method: 'POST',
                body: data,
                redirect: 'follow'
            };

            fetch("http://127.0.0.1:5000/api/options", requestOptions)
                .then(response => {
                    if (response) {
                        toast.success("Scan options saved")
                    } else {
                        toast.error("Error saving options. Please try again.")
                    }
                })
        }

        render() {
            const { image } = this.state
            const { output } = this.state
            const { editToggle } = this.state
            const { admin } = this.state
            const { scanOp } = this.state
            const { loading } = this.state
            const { invoice_number } = this.state
            const { vendor_name } = this.state
            const { client_name } = this.state
            const { address } = this.state
            const { address_line_2 } = this.state
            const { address_line_3 } = this.state
            const { account_number } = this.state
            const { invoice_date } = this.state
            const { due_date } = this.state
            const { total_amount } = this.state
            const { bpay_code } = this.state
            const { bpay_ref } = this.state
            const { eft_account_num } = this.state
            const { eft_account_name } = this.state
            const { eft_bsb } = this.state
            const { postbillpay_code } = this.state
            const { postbillpay_ref } = this.state
            // const { name } = this.state
            return (

                <div>
                    <Container>
                        <Navbar>
                            <Navbar.Brand>OCR System</Navbar.Brand>
                            <LinkContainer to='/extract'><Nav.Link>Extracted Information</Nav.Link></LinkContainer>
                            {admin && <LinkContainer to='/adminstats'><Nav.Link>System Statistics</Nav.Link></LinkContainer>}
                            <Navbar.Collapse className="justify-content-end">

                                <Navbar.Text>
                                    Signed in as: {name}
                                </Navbar.Text>
                                <Nav.Link onClick={(e) => logout(e)}>Logout</Nav.Link>
                            </Navbar.Collapse>
                        </Navbar>
                        <Row>
                            <h1 className="heading">Upload Bill</h1>
                        </Row>
                        <Row>
                            <Col className="colLeft">
                                <form encType="multipart/form-data">
                                    <Image className="imageMain" src={image} />
                                    <Row>
                                        <Col>
                                            <Button className="mainButton" style={style}>
                                                <label for="input">Select File</label>
                                                <input type="file" name="image" id="input" accept="image/*" style={{ display: 'none' }} ref={this.fileInput} onChange={this.imageHandler} />
                                            </Button>
                                            <Button onClick={this.submitHandler} className="mainButton" style={style}>Upload</Button>
                                            {admin && <Button onClick={this.optionButton} className="adminButton" style={style}>Additional Scan options</Button>}
                                            {admin && <Button onClick={this.trainButton} className="adminButton" style={style}>Train Network</Button>}
                                        </Col>
                                    </Row>
                                </form>
                            </Col>
                            <Col className="colRight">
                                {loading && <div className="loading">
                                    <Spinner animation="border" role="status">
                                    </Spinner>
                                </div>}
                                {/* https://www.nicesnippets.com/blog/react-js-get-multiple-checkbox-value-on-submit */}
                                {admin && scanOp && <div>
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
                                    <Button onClick={this.submitHandler2}>Save options</Button>
                                </div>}

                                {editToggle && output && <div>
                                    <p>Scan Results</p>
                                    <Table borderless>
                                        <tr>
                                            <td className="tableName">Invoice Number: </td>
                                            <td>{invoice_number}</td>
                                        </tr>
                                        <tr>
                                            <td className="tableName">Vendor: </td>
                                            <td>{vendor_name}</td>
                                        </tr>
                                        <tr>
                                            <td className="tableName">Name: </td>
                                            <td>{client_name}</td>
                                        </tr>
                                        <tr>
                                            <td className="tableName">Address: </td>
                                            <td>{address}</td>
                                        </tr>
                                        {address_line_2 && <tr>
                                            <td className="tableName">Address Line 2: </td>
                                            <td>{address_line_2}</td>
                                        </tr>}
                                        {(address_line_3) && <tr>
                                            <td className="tableName">Address Line 3: </td>
                                            <td>{address_line_3}</td>
                                        </tr>}
                                        <tr>
                                            <td className="tableName">Account Number: </td>
                                            <td>{account_number}</td>
                                        </tr>
                                        <tr>
                                            <td className="tableName">Invoice Date: </td>
                                            <td>{invoice_date}</td>
                                        </tr>
                                        <tr>
                                            <td className="tableName">Due Date: </td>
                                            <td>{due_date}</td>
                                        </tr>
                                        <tr>
                                            <td className="tableName">Total Amount: </td>
                                            <td>{total_amount}</td>
                                        </tr>
                                        {(bpay_code || bpay_ref) && <tr>
                                            <td className="tableName">BPAY Code: </td>
                                            <td>{bpay_code}</td>
                                        </tr>}
                                        {(bpay_code || bpay_ref) && <tr>
                                            <td className="tableName">BPAY Reference Number: </td>
                                            <td>{bpay_ref}</td>
                                        </tr>}

                                        {(eft_account_num || eft_account_name || eft_bsb) && <tr>
                                            <td className="tableName">Eftpos Account Number: </td>
                                            <td>{eft_account_num}</td>
                                        </tr>}
                                        {(eft_account_num || eft_account_name || eft_bsb) && <tr>
                                            <td className="tableName">Eftpos Account Name: </td>
                                            <td>{eft_account_name}</td>
                                        </tr>}
                                        {(eft_account_num || eft_account_name || eft_bsb) && <tr>
                                            <td className="tableName">Eftpos BSB: </td>
                                            <td>{eft_bsb}</td>
                                        </tr>}
                                        {(postbillpay_code || postbillpay_ref) && <tr>
                                            <td className="tableName">Post Billpay Code: </td>
                                            <td>{postbillpay_code}</td>
                                        </tr>}
                                        {(postbillpay_code || postbillpay_ref) && <tr>
                                            <td className="tableName">Post Billpay Reference Number: </td>
                                            <td>{postbillpay_ref}</td>
                                        </tr>}
                                    </Table>
                                    <Button onClick={this.toggleButton}>Edit</Button>{' '}
                                    <Button variant="primary" type="submit" onClick={this.createCustomer}>Save</Button>
                                </div>}

                                {!editToggle && <div>
                                    <p>User correction</p>
                                    <Form onSubmit={this.createCustomer}>
                                        <Row>
                                            <Col>
                                                <Form.Group controlId="invoicenumber">
                                                    <Form.Label>Invoice Number</Form.Label>
                                                    <Form.Control type="text" Value={invoice_number} onChange={e => this.setState({ invoice_number: e.target.value })} />
                                                </Form.Group>
                                            </Col>
                                            <Col>
                                                <Form.Group controlId="vendorname">
                                                    <Form.Label>Vendor Name</Form.Label>
                                                    <Form.Control type="text" Value={vendor_name} onChange={e => this.setState({ vendor_name: e.target.value })} />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                        <Form.Group controlId="name">
                                            <Form.Label>Name</Form.Label>
                                            <Form.Control type="text" Value={client_name} onChange={e => this.setState({ client_name: e.target.value })} />
                                        </Form.Group>
                                        <Form.Group controlId="address">
                                            <Form.Label>Address</Form.Label>
                                            <Form.Control type="text" Value={address} onChange={e => this.setState({ address: e.target.value })} />
                                        </Form.Group>
                                        <Form.Group controlId="address2">
                                            <Form.Label>Address Line 2</Form.Label>
                                            <Form.Control type="text" Value={address_line_2} onChange={e => this.setState({ address_line_2: e.target.value })} />
                                        </Form.Group>
                                        <Form.Group controlId="address3">
                                            <Form.Label>Address Line 3</Form.Label>
                                            <Form.Control type="text" Value={address_line_3} onChange={e => this.setState({ address_line_3: e.target.value })} />
                                        </Form.Group>
                                        <Row>
                                            <Col>
                                                <Form.Group controlId="accountnumber">
                                                    <Form.Label>Account Number</Form.Label>
                                                    <Form.Control type="text" Value={account_number} onChange={e => this.setState({ account_number: e.target.value })} />
                                                </Form.Group>
                                            </Col>
                                            <Col>
                                                <Form.Group controlId="totalamount">
                                                    <Form.Label>Total Amount</Form.Label>
                                                    <Form.Control type="text" Value={total_amount} onChange={e => this.setState({ total_amount: e.target.value })} />
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col>
                                                <Form.Group controlId="invoicedate">
                                                    <Form.Label>Invoice Date</Form.Label>
                                                    <Form.Control type="text" Value={invoice_date} onChange={e => this.setState({ invoice_date: e.target.value })} />
                                                </Form.Group>
                                            </Col>
                                            <Col>
                                                <Form.Group controlId="duedate">
                                                    <Form.Label>Due Date</Form.Label>
                                                    <Form.Control type="text" Value={due_date} onChange={e => this.setState({ due_date: e.target.value })} />
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col>
                                                <Form.Group controlId="bpaycode">
                                                    <Form.Label>BPAY Code</Form.Label>
                                                    <Form.Control type="text" Value={bpay_code} onChange={e => this.setState({ bpay_code: e.target.value })} />
                                                </Form.Group>
    
                                            </Col>
                                            <Col>
                                                <Form.Group controlId="bpayreference">
                                                    <Form.Label>BPAY Reference Number</Form.Label>
                                                    <Form.Control type="text" Value={bpay_ref} onChange={e => this.setState({ bpay_ref: e.target.value })} />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col>
                                                <Form.Group controlId="eftnumber">
                                                    <Form.Label>Eftpos Account Number</Form.Label>
                                                    <Form.Control type="text" Value={eft_account_num} onChange={e => this.setState({ eft_account_num: e.target.value })} />
                                                </Form.Group>
                                            </Col>
                                            <Col>
                                                <Form.Group controlId="eftbsb">
                                                    <Form.Label>Eftpos BSB</Form.Label>
                                                    <Form.Control type="text" Value={eft_bsb} onChange={e => this.setState({ eft_bsb: e.target.value })} />
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <Form.Group controlId="eftname">
                                            <Form.Label>Eftpos Account Name</Form.Label>
                                            <Form.Control type="text" Value={eft_account_name} onChange={e => this.setState({ eft_account_name: e.target.value })} />
                                        </Form.Group>


                                        <Row>
                                            <Col>
                                                <Form.Group controlId="postbillpaycode">
                                                    <Form.Label>Post Billpay Code</Form.Label>
                                                    <Form.Control type="text" Value={postbillpay_code} onChange={e => this.setState({ postbillpay_code: e.target.value })} />
                                                </Form.Group>
                                            </Col>
                                            <Col>
                                                <Form.Group controlId="postbillpayref">
                                                    <Form.Label>Post Billpay Reference Number</Form.Label>
                                                    <Form.Control type="text" Value={postbillpay_ref} onChange={e => this.setState({ postbillpay_ref: e.target.value })} />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                        <Button onClick={this.toggleButton}>Return</Button>{' '}
                                        <Button variant="primary" type="submit">Save</Button>
                                    </Form>
                                </div>}

                            </Col>
                        </Row>
                    </Container>
                </div>

            );

        }

    }
    return (
        <>
            <App />
        </>

    );

}

export default OCR;