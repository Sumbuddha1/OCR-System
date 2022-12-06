import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import NavBar from "./navbar";
import { Col, Container, Form, Row, Table, Image, Button, Navbar, ToggleButton, ToggleButtonGroup, Spinner, Nav } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap'

/*
* code to display the analytics page only visible to admin
* The page is not visible for normal users. 
*/
const AdminStats = ({ setAuth }) => {
    const logout = async (e) => {//for logout functionalities 
        e.preventDefault();
        try {
            localStorage.removeItem("token");
            setAuth(false);
            toast.success("Successfully logged out");
        } catch (err) {
            console.error(err.message);
        }
    };
    const [invoices, setInvoices] = useState("");
    const [users, setUsers] = useState("");
    const [name, setName] = useState("");
    const [user, setUser] = useState("");
    const getProfile = async () => {//connecting to query in api that gets the total invoices number 
        try {
            const res = await fetch("http://localhost:3003/dashboard/totalinvoices", {
                method: "GET",
                headers: { jwt_token: localStorage.token },
            });

            const parseData = await res.json();
            setInvoices(parseData[0].count); 
            const res2 = await fetch("http://localhost:3003/dashboard/", {//to display the name of logged in user
                method: "GET",
                headers: { jwt_token: localStorage.token },
            });

            const parseData2 = await res2.json();
            setName(parseData2[0].user_name);
        } catch (err) {
            console.error(err.message);
        }

    };
    const getUsers = async () => {//connecting to query in api that gets the total users number 
        try {
            const res = await fetch("http://localhost:3003/dashboard/totalusers", {
                method: "GET",
                headers: { jwt_token: localStorage.token },
            });

            const parseData = await res.json();
            console.log(parseData['count']);

            setUsers(parseData[0].count);
        } catch (err) {
            console.error(err.message);
        }

    };

    useEffect(() => {
        getProfile();
        getUsers();
    });
    return (
        <div>
            <Navbar>
                <Navbar.Brand>System Statistics</Navbar.Brand>
                <LinkContainer to='/ocr'><Nav.Link>OCR System</Nav.Link></LinkContainer>
                <LinkContainer to='/extract'><Nav.Link>Extracted Information</Nav.Link></LinkContainer>
                <Navbar.Collapse className="justify-content-end">

                    <Navbar.Text>
                        Signed in as: {name}
              </Navbar.Text>
                    <Nav.Link onClick={(e) => logout(e)}>Logout</Nav.Link>
                </Navbar.Collapse>
            </Navbar>
            <br /><br /><br></br>
            <h2 style={{ float: "middle" }}>Total number of scanned invoices are: {invoices} </h2>
            <h2 style={{ float: "middle" }}>Total number of users are: {users} </h2>


        </div >

    );
}
export default AdminStats;