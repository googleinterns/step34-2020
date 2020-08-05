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

const NAVBAR_STYLING = {
  bg: 'light',
  expand: 'lg',
  mapButtonStyle: {
    cursor: 'pointer'
  },
  ariaControls: 'basic-navbar-nav'
}
const BUTTON_STYLING = {
  marginRight:".8rem", 
  marginTop: ".3rem"
}
const PROFILE_BUTTON_STYLING = {
  border: "2px solid #1A73E8",
  maxWidth: "3rem",
  maxHeight: "3rem",
  marginRight:".8rem",
  margin:"auto"
};

const PROFILE_PIC = "https://moonvillageassociation.org/wp-content/uploads/2018/06/default-profile-picture1.jpg";

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
    this.renderModal = this.renderModal.bind(this);
    this.redirectPage = this.redirectPage.bind(this);

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
    const currentState = {
      loggedIn: false,
    }
    this.props.changeMapState(currentState); 
    this.reduxState = this.props.articles[0];
    this.setState(currentState);
  }

  handleLogoutButton() {
    Firebase.auth().signOut();
    this.redirectPage('/');
  }

  redirectPage(pathname) {
    this.props.history.push({
      pathname: pathname
    });
  }

  renderModal() {
    ReactDOM.render(
      <Provider store={store}>
        <div id="modal">
          <Modal history={this.props.history}/>
        </div>
      </Provider>,
      document.getElementById('modal-wrapper')
    );
  }
  
  handleLoginButtonClick() {
    this.renderModal();
  }

  handleMapViewonClick() {
    this.redirectPage('/map/')
  }

  handleProfileButtonClick() {
    if (this.state.loggedIn) {
      this.redirectPage('/profile/');
    } else {
      this.renderModal();
    }
  }

  handleCreateButton() {
    if (this.state.loggedIn) {
      this.redirectPage('/create/');
    } else {
      this.renderModal();
    }
  }
  
  render() {
    return(
      <Navbar
        bg={NAVBAR_STYLING.bg}
        expand={NAVBAR_STYLING.expand} 
        style={style}>
        <Navbar.Brand href="/">IT</Navbar.Brand>
        <Navbar.Brand
          style={NAVBAR_STYLING.mapButtonStyle}
          onClick={this.handleMapViewonClick.bind(this)}>Map</Navbar.Brand>
        <Navbar.Toggle aria-controls={NAVBAR_STYLING.ariaControls}/>
        <Navbar.Collapse id="basic-navbar-nav">  
          <Nav className="mr-auto"></Nav>
          <Nav>
            <CreateEventButton
              onClick={this.handleCreateButton.bind(this)}
              loggedIn={this.state.loggedIn} />
            <ProfileButtonNav
              onClick={this.handleProfileButtonClick.bind(this)}
              onLogout={this.handleLogoutButton.bind(this)}
              loggedIn={this.state.loggedIn}
              credentials={this.state.credentials} />
            <LoginButtonNav
              onClick={this.handleLoginButtonClick.bind(this)}
              loggedIn={this.state.loggedIn} />
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    )
  }
}


function CreateEventButton(props) {
  return (
    <div>
      <Button 
        type="button" 
        variant="primary"
        style={BUTTON_STYLING}
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
          style={BUTTON_STYLING}
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
          <Dropdown.Toggle 
            as={Image}
            style={PROFILE_BUTTON_STYLING}
            type="button" 
            variant="primary" 
            roundedCircle
            src={PROFILE_PIC}>
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item
              as={Button}
              onClick={props.onClick}>Profile</Dropdown.Item>
            <Dropdown.Item
              as={Button}
              onClick={props.onLogout}>Logout</Dropdown.Item>
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
