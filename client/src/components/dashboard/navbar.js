import React from 'react';
import {Link} from 'react-router-dom';

const NavBar = () =>(

        <>
                    <Link to = "/ocr" className="btn btn-primary">OCR Engine</Link> &emsp;
           
                    <Link to = "/extract" className="btn btn-primary">Extracted Information</Link>
              </>
        );

export default NavBar;