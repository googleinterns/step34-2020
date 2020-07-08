import React from 'react'
import ReactDOM from 'react-dom';
import { Navbar, Nav, Button } from 'react-bootstrap'
import Modal from './SignInUpModal';
import Profile from './Profile';
import style from 'bootstrap/dist/css/bootstrap.css';
import Create from './CreateEvent';
import { authStatus } from '../App';

class TopNavbar extends React.Component {
  handleLoginButtonClick() {
    // If the user is signed in
    /* TODO: Route to profile page */

    // If the user is not signed in
    /* TODO: Add modal prompt */
    if (!authStatus.isAuthenticated()) {
      ReactDOM.render(
        <div>
          <Modal />
        </div>,
        document.getElementById('root')
      );
    }
  }

  handleProfileButtonClick() {
    // If the user is signed in route to profile
    // If the user is not signed in route to the signin modal

    if (authStatus.isAuthenticated()) {
      ReactDOM.render(
        <div>
          <Profile />
        </div>,
        document.getElementById('welcome')
      );
    } else {
      ReactDOM.render(
        <div>
          <Modal />
        </div>,
        document.getElementById('root')
      );
    }
  }

  handleCreateButton() {
    if (authStatus.isAuthenticated()) {
      ReactDOM.render(
        <div>
          <Create />
        </div>,
        document.getElementById('welcome')
      );
    } else {
      ReactDOM.render(
        <div>
          <Modal />
        </div>,
        document.getElementById('root')
      );
    }
  }
  
  render() {
    return(
      <Navbar bg="dark" expand="lg">
        <Navbar.Brand>MapIT</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav"/>
        <Navbar.Collapse id="basic-navbar-nav">  
          <Nav className="mr-auto"></Nav>
          <Nav>
            <Button 
              style={{marginRight:".8rem"}}
              type="button" 
              variant="primary"
              onClick={this.handleCreateButton}>
              Create Event
            </Button>
            <LoginButtonNav onClick={this.handleLoginButtonClick} />
            <ProfileButtonNav onClick={this.handleProfileButtonClick} />
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    )
  }
}

function LoginButtonNav(props) {
  return (
    <div>
      <Button 
        style={{marginRight:".8rem"}}
        type="button" 
        variant="primary" 
        onClick={props.onClick}>
        Login
      </Button>
    </div>
  );
  // If the user is NOT signed in
  // return <Image src="" onClick={this.handleTopRightButtonClick()}/>
}

function ProfileButtonNav(props) {

  return (
    <div>
      <Button 
        style={{marginRight:".8rem"}}
        type="button" 
        variant="primary" 
        onClick={props.onClick}>
        Profile
      </Button>
    </div>
  );

  //If the user is not signed in
  //return to current page
}


export default TopNavbar;
