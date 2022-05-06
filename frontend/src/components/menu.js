import React from 'react';
import {Navbar, Nav} from 'react-bootstrap';
import {default_query} from "./utils";

const Menu = () => {
  var query = default_query();
  return (
    <div className="app tc f3">
      <Navbar bg="dark" variant="dark" expand='lg'>
        <Navbar.Brand href="/home">AoE Pulse</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className='mr-auto'>
            <Nav.Link href={"/civ_stats" + query}>Civilization Stats</Nav.Link>
            <Nav.Link href={"/opening_stats" + query}>Opening Stats</Nav.Link>
            <Nav.Link href={"/opening_matchups" + query}>Opening Matchups</Nav.Link>
            <Nav.Link href={"/opening_techs" + query}>Opening Tech Timings</Nav.Link>
            <Nav.Link href={"/advanced"}>Advanced</Nav.Link>
          </Nav>
          <Nav className='ml-auto'>
            <Navbar.Brand href='https://ko-fi.com/M4M7BG61H'>
                <img height='36' src='https://cdn.ko-fi.com/cdn/kofi1.png?v=3' border='0' alt='Buy Me a Coffee at ko-fi.com' />
            </Navbar.Brand>
            <Nav>
              <Nav.Link href={"/about"}>About</Nav.Link>
            </Nav>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    </div>
  );
}

export default Menu;
