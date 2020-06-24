import React from 'react'
import { Navbar, Nav, Button } from 'react-bootstrap'
import style from 'bootstrap/dist/css/bootstrap.css';

class TopNavbar extends React.Component {
  
  handleTopRightButtonClick() {
    // If the user is signed in
    /* TODO: Route to profile page */

    // If the user is not signed in
    /* TODO: Add modal prompt */
  }

  render() {
    return(
      <Navbar bg="light" expand="lg">
        <Navbar.Brand href="#home">IT</Navbar.Brand>
      	<Navbar.Toggle aria-controls="basic-navbar-nav"/>
      	<Navbar.Collapse id="basic-navbar-nav">  
          <Nav className="mr-auto">
    	    <Nav.Link href="#map">Map</Nav.Link>
          </Nav>
          <Nav>
            <Button type="button" variant="primary">Create Event</Button>{' '}
            <TopRightButtonNav onClick={this.handleTopRightButtonClick} />
          </Nav>
      	</Navbar.Collapse>
      </Navbar>
    )
  }
}

function TopRightButtonNav(props) {
  // If the user is signed in
  return (
    <Button type="button" variant="secondary" onClick={props.onClick}>Login</Button>
  );
  
  // If the user is NOT signed in
  // return <Image src="" onClick={this.handleTopRightButtonClick()}/>

}

export default TopNavbar;
