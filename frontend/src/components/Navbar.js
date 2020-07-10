import React from 'react'
import ReactDOM from 'react-dom';
import { Navbar, Nav, Button } from 'react-bootstrap'
import Modal from './SignInUpModal';
import Profile from './Profile';
import App from '../App';
import style from 'bootstrap/dist/css/bootstrap.css';
import Create from './CreateEvent';
import { authStatus } from '../App';
import { Provider } from "react-redux";
import store from "../store/index";
import Firebase from 'firebase';

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
        document.getElementById('root')
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

  async handleLogoutButton() {
    //sign out the user
    await Firebase.auth().signOut();

    // clear local storage
    //localStorage.clear();

    ReactDOM.render(
      <Provider store={store}>
        <App />
      </Provider>, 
      document.getElementById('root')
    );
  }

  handleCreateButton(props) {
    if (authStatus.isAuthenticated()) {
      ReactDOM.render(
        <div>
          <Create />
        </div>,
        document.getElementById('root')
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
      <Navbar bg="dark" expand="lg" style={style}>
        <Navbar.Brand>MapIT</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav"/>
        <Navbar.Collapse id="basic-navbar-nav">  
          <Nav className="mr-auto"></Nav>
          <Nav>
            <CreateEventButton onClick={this.handleCreateButton} loggedIn={this.props.loggedIn} />
            <ProfileButtonNav onClick={this.handleProfileButtonClick} />
            <LoginButtonNav onClick={this.handleLoginButtonClick} loggedIn={this.props.loggedIn} />
            <LogOutButton onClick={this.handleLogoutButton} loggedIn={this.props.loggedIn} />
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    )
  }
}

function LogOutButton(props) {
  if (props.loggedIn) {
    return (
      <div>
        <Button 
          style={{marginRight:".8rem"}}
          type="button" 
          variant="primary"
          onClick={props.onClick}>
          Logout
        </Button>
      </div>
    )
  } else {
    return null;
  }
}

function CreateEventButton(props) {
  return (
    <div>
      <Button 
        style={{marginRight:".8rem"}}
        type="button" 
        variant="primary"
        onClick={props.onClick}>
        Create Event
      </Button>
    </div>
  );
}

function LoginButtonNav(props) {
  if (!props.loggedIn){
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
  } else {
    return null;
  }
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
}


export default TopNavbar;
