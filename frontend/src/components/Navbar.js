import React from 'react'
import ReactDOM from 'react-dom';
import { Navbar, Nav, Button } from 'react-bootstrap'
import Modal from './SignInUpModal';
import style from 'bootstrap/dist/css/bootstrap.css';
import Firebase from 'firebase';

export default class TopNavbar extends React.Component {
  constructor(props) {
    super(props);

    this.state= {
      loggedIn: props.loggedIn,
      history: props.history,
    }

    var credentials;

    if (props.credentials) {
      this.credentials = props.credentials;
    } else if (props.history.location.state){
      if (props.history.location.state.credentials) {
        this.credentials = props.history.location.state.credentials;
      }
    }
  }

  handleLoginButtonClick() {
    ReactDOM.render(
      <div id="modal">
        <Modal history={this.props.history}/>
      </div>,
      document.getElementById('modal-wrapper')
    );
  }

  handleMapViewonClick() {
    if (!this.props.loggedIn) {
      ReactDOM.render(
        <div id="modal">
          <Modal history={this.props.history}/>
        </div>,
        document.getElementById('modal-wrapper')
      );
    } else {
      this.props.history.push({
        pathname: '/map/',
        state: {loggedIn: this.props.loggedIn, credentials: this.credentials}
      });
    }
  }

  handleProfileButtonClick() {
    // If the user is signed in route to profile
    // If the user is not signed in route to the signin modal
    if (this.props.loggedIn) {
      this.props.history.push({
        pathname: '/profile/',
        state: {loggedIn: this.props.loggedIn, credentials: JSON.stringify(this.credentials)}
      })
    } else {
      ReactDOM.render(
        <div id="modal">
          <Modal history={this.props.history}/>
        </div>,
        document.getElementById('modal-wrapper')
      );
    }
  }

  handleLogoutButton() {
    //sign out the user
    Firebase.auth().signOut();

    this.props.history.push({
      pathname:'/',
    })
  }

  handleCreateButton() {
    if (this.props.loggedIn) {
      this.props.history.push({
        pathname: '/create/',
        state: {loggedIn: this.props.loggedIn, credentials: this.credentials}
      })
    } else {
      ReactDOM.render(
        <div id="modal">
          <Modal history={this.props.history}/>
        </div>,
        document.getElementById('modal-wrapper')
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
            <MapViewButton onClick={this.handleMapViewonClick.bind(this)} loggedIn={this.props.loggedIn} />
            <CreateEventButton onClick={this.handleCreateButton.bind(this)} loggedIn={this.props.loggedIn} />
            <ProfileButtonNav onClick={this.handleProfileButtonClick.bind(this)} loggedIn={this.props.loggedIn} credentials={this.props.credentials} />
            <LoginButtonNav onClick={this.handleLoginButtonClick.bind(this)} loggedIn={this.props.loggedIn} />
            <LogOutButton onClick={this.handleLogoutButton.bind(this)} loggedIn={this.props.loggedIn} />
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    )
  }
}

function MapViewButton(props) {
  return (
    <div>
      <Button 
        style={{marginRight:".8rem"}}
        type="button" 
        variant="primary"
        onClick={props.onClick}>
        View events
      </Button>
    </div>
  )
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
