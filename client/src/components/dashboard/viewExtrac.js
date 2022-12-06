import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import NavBar from "./navbar";
import ListCustomer from "./table";
import { Col, Container, Form, Row, Table, Image, Button, Navbar, ToggleButton, ToggleButtonGroup, Spinner, Nav } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap'

/*
* function where information stored in database is called through api 
* Listcustomer is called and allDatas has been passed in it as a parameter which executes the overall table. 
*/
const Extract = ({ setAuth }) => {
    const [allDatas, setAllDatas] = useState([]);
    const logout = async (e) => {
        e.preventDefault();
        try {
            localStorage.removeItem("token");
            setAuth(false);
            toast.success("Successfully logged out");
        } catch (err) {
            console.error(err.message);
        }
    };
    const [name, setName] = useState("");
    const [user, setUser] = useState("");
    const [admin, setAdmin] = useState("");
    const getProfile = async () => {
        try {
            const res = await fetch("http://localhost:3003/dashboard/", {
                method: "GET",
                headers: { jwt_token: localStorage.token },
            });

            const parseData = await res.json();
            
            setName(parseData[0].user_name);//to display name of loged in user at nav bar
            setUser(parseData[0].user_username);//for admins authorization
            if (user == "admin1") {//to check the loged in user as admin 
                setAdmin(true);
            }

            if (!admin) {
                setAllDatas(parseData);
            } else {
                const res2 = await fetch("http://localhost:3003/dashboard/extractall", {//to get the information of entire table.
                    method: "GET",
                    headers: { jwt_token: localStorage.token} ,
                });
                const parseData2 = await res2.json();
                setAllDatas(parseData2)//all database table information into alldatas array
            }
            
            
        } catch (err) {
            console.error(err.message);
        }
    };

    useEffect(() => {
        getProfile();
    });

    return (
        <div>
            <div>
                <Navbar>
                    <Navbar.Brand>Extracted Information</Navbar.Brand>
                    <LinkContainer to='/ocr'><Nav.Link>OCR System</Nav.Link></LinkContainer>
                    {admin && <LinkContainer to='/adminstats'><Nav.Link>System Statistics</Nav.Link></LinkContainer>}
                    <Navbar.Collapse className="justify-content-end">

                        <Navbar.Text>
                            Signed in as: {name}
                        </Navbar.Text>
                        <Nav.Link onClick={(e) => logout(e)}>Logout</Nav.Link>
                    </Navbar.Collapse>
                </Navbar>
            </div>
            <div>
                <ListCustomer allDatas={allDatas}/>
            </div>
        </div>

    );
}
export default Extract;