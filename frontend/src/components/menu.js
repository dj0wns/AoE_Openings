import React from 'react';
import { Navbar, NavItem, NavDropdown, MenuItem, Nav, Form, FormControl, Button } from 'react-bootstrap';

const Menu = () => {
  return (
    <div className="app tc f3">
      <Navbar bg="dark" variant="dark" expand='lg'>
        <Navbar.Brand href="/home">AoE Pulse</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className='mr-auto'>
            <Nav.Link href="/civ_stats">Civilization Stats</Nav.Link>
            <Nav.Link href="/opening_stats">Opening Stats</Nav.Link>
            <Nav.Link href="/opening_matchups">Opening Matchups</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    </div>
  );
}

export default Menu;
