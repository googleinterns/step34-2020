import React from 'react'
import ReactDOM from 'react-dom';
import { Navbar, Nav, Button } from 'react-bootstrap'
import style from 'bootstrap/dist/css/bootstrap.css';
import Modal from './SignInUpModal';

class TopNavbar extends React.Component {
  handleTopRightButtonClick() {
    // If the user is signed in
    /* TODO: Route to profile page */

    // If the user is not signed in
    /* TODO: Add modal prompt */
    ReactDOM.render(
      <React.StrictMode>
        <Modal />
      </React.StrictMode>,
      document.getElementById('login')
    );
    
  }

  render() {
    return(
      <Navbar bg="light" expand="lg">
        <Navbar.Brand href="#home">MapIT</Navbar.Brand>
      	<Navbar.Toggle aria-controls="basic-navbar-nav"/>
      	<Navbar.Collapse id="basic-navbar-nav">  
          <Nav className="mr-auto"></Nav>
          <Nav>
            <Button 
              style={{marginRight:".8rem"}}
              type="button" 
              variant="primary">
              Create Event
            </Button>{' '}
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
    <div>
      <Button 
        style={{marginRight:".8rem"}}
        type="button" 
        variant="secondary" 
        onClick={props.onClick}>
        Login
      </Button>
      <Button 
        style={{marginRight:".8rem"}}
        type="button" 
        variant="secondary" 
        onClick={props.onClick}>
        profile
      </Button>
    </div>

  );
  
  // If the user is NOT signed in
  // return <Image src="" onClick={this.handleTopRightButtonClick()}/>
}

export default TopNavbar;
