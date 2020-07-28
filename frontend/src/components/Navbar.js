import React from 'react'
import ReactDOM from 'react-dom';
import { Dropdown, Image, Navbar, Nav, Button } from 'react-bootstrap'
import Modal from './SignInUpModal';
import style from 'bootstrap/dist/css/bootstrap.css';
import Firebase from 'firebase';
import '../navbarStyle.css';
import { changeMapState } from "../actions/index";
import { connect } from "react-redux";
import store from "../store/index";
import { Provider } from "react-redux";

function mapDispatchToProps(dispatch) {
  return {
    changeMapState: mapState => dispatch(changeMapState(mapState))
  };
}

const mapStateToProps = state => {
  return { articles: state.articles };
}

class TopNavbar extends React.Component {
  constructor(props) {
    super(props);
    
    this.reduxState = this.props.articles[0];

    if (this.reduxState) {
      this.state = {
        loggedIn: this.reduxState.loggedIn,
        plusCode: this.reduxState.plusCode,
        credentials: this.reduxState.credentials
      }
    } else {
      this.state = {
        loggedIn: false,
      }
    }
  }

  logOutAndUpdateRedux() {
    // update redux
    const currentState = {
      loggedIn: false,
    }
    this.props.changeMapState(currentState); 
    this.reduxState = this.props.articles[0];
    this.setState(currentState);
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
      <Provider store={store}>
        <div id="modal">
          <Modal history={this.props.history}/>
        </div>
      </Provider>,
      document.getElementById('modal-wrapper')
    );
  }

  handleMapViewonClick() {
    this.props.history.push({
      pathname: '/map/',
    });
  }

  handleProfileButtonClick() {
    // If the user is signed in route to profile
    // If the user is not signed in route to the signin modal
    if (this.state.loggedIn) {
      this.props.history.push({
        pathname: '/profile/',
      })
    } else {
      ReactDOM.render(
        <Provider store={store}>
          <div id="modal">
            <Modal history={this.props.history}/>
          </div>
        </Provider>,
        document.getElementById('modal-wrapper')
      );
    }
  }

  handleCreateButton() {
    if (this.state.loggedIn) {
      this.props.history.push({
        pathname: '/create/',
      })
    } else {
      ReactDOM.render(
        <Provider store={store}>
          <div id="modal">
            <Modal history={this.props.history}/>
          </div>
        </Provider>,
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

const ConnectedTopNavbar = connect(
  mapStateToProps,
  mapDispatchToProps
)(TopNavbar);

export default ConnectedTopNavbar;
