import React from 'react'
import ReactDOM from 'react-dom';
import { Dropdown, Image, Navbar, Nav, Button } from 'react-bootstrap'
import Modal from './SignInUpModal';
import style from 'bootstrap/dist/css/bootstrap.css';
import Firebase from 'firebase';
import logo from '../IT.png';
import '../navbarStyle.css';

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

  handleLogoutButton() {
    //sign out the user
    Firebase.auth().signOut();

    this.props.history.push({
      pathname:'/',
    })
  }
  
  handleLoginButtonClick() {
    ReactDOM.render(
      <div id="modal">
        <Modal history={this.props.history} plus_code={this.props.plus_code}/>
      </div>,
      document.getElementById('modal-wrapper')
    );
  }

  handleMapViewonClick() {
    this.props.history.push({
      pathname: '/map/',
      state: {loggedIn: this.props.loggedIn, credentials: this.credentials, plus_code: this.props.plus_code}
    });
  }

  handleProfileButtonClick() {
    // If the user is signed in route to profile
    // If the user is not signed in route to the signin modal
    if (this.props.loggedIn) {
        console.log(this.props.plus_code)
      this.props.history.push({
        pathname: '/profile/',
        state: {loggedIn: this.props.loggedIn, credentials: JSON.stringify(this.credentials), plus_code: this.props.plus_code}
      })
    } else {
      ReactDOM.render(
        <div id="modal">
          <Modal history={this.props.history} plus_code={this.props.plus_code}/>
        </div>,
        document.getElementById('modal-wrapper')
      );
    }
  }

  handleCreateButton() {
    if (this.props.loggedIn) {
      this.props.history.push({
        pathname: '/create/',
        state: {loggedIn: this.props.loggedIn, credentials: this.credentials, plus_code: this.props.plus_code}
      })
    } else {
      ReactDOM.render(
        <div id="modal">
          <Modal history={this.props.history} plus_code={this.props.plus_code}/>
        </div>,
        document.getElementById('modal-wrapper')
      );
    }
  }
  
  render() {
    return(
      <Navbar bg="light" expand="lg" style={style}>
        <Navbar.Brand href="/">IT</Navbar.Brand>
        <Navbar.Brand onClick={this.handleMapViewonClick.bind(this)}>Map</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav"/>
        <Navbar.Collapse id="basic-navbar-nav">  
          <Nav className="mr-auto"></Nav>
          <Nav>
            <CreateEventButton onClick={this.handleCreateButton.bind(this)} loggedIn={this.props.loggedIn} />
            <ProfileButtonNav onClick={this.handleProfileButtonClick.bind(this)} onLogout={this.handleLogoutButton.bind(this)} loggedIn={this.props.loggedIn} credentials={this.props.credentials} />
            <LoginButtonNav onClick={this.handleLoginButtonClick.bind(this)} loggedIn={this.props.loggedIn} />
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

function CreateEventButton(props) {
  return (
    <div>
      <Button 
        type="button" 
        variant="primary"
        style={{marginRight:".8rem", marginTop: ".3rem"}}
        className="custom-btn"
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
        <Button inline="true" 
          style={{marginRight:".8rem", marginTop: ".3rem"}}
          type="button" 
          variant="outline-primary" 
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
  if (props.loggedIn) {
    return (
      <div>
	<Dropdown alignRight>
	  <Dropdown.Toggle  as={Image} style={{border: "2px solid #1A73E8", maxWidth: "3rem", maxHeight: "3rem", marginRight:".8rem", margin:"auto"}}
	      type="button" 
	      variant="primary" 
	      roundedCircle
	     src="https://moonvillageassociation.org/wp-content/uploads/2018/06/default-profile-picture1.jpg">
	  </Dropdown.Toggle>
	  <Dropdown.Menu>
	    <Dropdown.Item as={Button} onClick={props.onClick}>Profile</Dropdown.Item>
	    <Dropdown.Item as={Button} onClick={props.onLogout}>Logout</Dropdown.Item>
	  </Dropdown.Menu>
	</Dropdown>
      </div>
    );
  } else {
    return null;
  }
}
