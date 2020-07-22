import React from 'react'
import ReactDOM from 'react-dom';
import { Navbar, Nav, Button } from 'react-bootstrap'
import Modal from './SignInUpModal';
import style from 'bootstrap/dist/css/bootstrap.css';
import Firebase from 'firebase';
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

    // this.state= {
    //   loggedIn: props.loggedIn,
    //   history: props.history,
    // }

    // var credentials;

    // if (props.credentials) {
    //   this.credentials = props.credentials;
    // } else if (props.history.location.state){
    //   if (props.history.location.state.credentials) {
    //     this.credentials = props.history.location.state.credentials;
    //   }
    // }

    if (this.props.articles[0]) {
      this.state = {
        loggedIn: this.props.articles[0].loggedIn,
        plusCode: this.props.articles[0].plusCode,
        credentials: this.props.articles[0].credentials
      }
    } else {
      this.state = {
        loggedIn: false,
      }
    }
  }

  updateReduxWhenLoggingOut() {
    // update redux
    const currentState = {
    //   query: this.props.articles[0].query,
    //   location: this.props.articles[0].location,
    //   locationObject: this.props.articles[0].locationObject,
    //   viewport: this.props.articles[0].viewport,
    //   plusCode: this.props.articles[0].plusCode,
      loggedIn: false,
    }
    this.props.changeMapState(currentState); 
    this.setState(currentState);
    console.log('redux updated')
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
    // if (!this.props.loggedIn) {
    if (!this.state.loggedIn) {
      ReactDOM.render(
        <Provider store={store}>
          <div id="modal">
            <Modal history={this.props.history} plus_code={this.props.plus_code}/>
          </div>
        </Provider>,
        document.getElementById('modal-wrapper')
      );
    } else {
      this.props.history.push({
        pathname: '/map/',
        state: {loggedIn: this.props.loggedIn, credentials: this.credentials, plus_code: this.props.plus_code}
      });
    }
  }

  handleProfileButtonClick() {
    // If the user is signed in route to profile
    // If the user is not signed in route to the signin modal
    // if (this.props.loggedIn) {
    if (this.state.loggedIn) {
    //   console.log(this.props.plus_code)
      this.props.history.push({
        pathname: '/profile/',
        state: {loggedIn: this.props.loggedIn, credentials: JSON.stringify(this.credentials), plus_code: this.props.plus_code}
      })
    } else {
      ReactDOM.render(
        <Provider store={store}>
          <div id="modal">
            <Modal history={this.props.history} plus_code={this.props.plus_code}/>
          </div>
        </Provider>,
        document.getElementById('modal-wrapper')
      );
    }
  }

  handleLogoutButton() {
    //sign out the user
    Firebase.auth().signOut();

    // change the state to logged out
    this.updateReduxWhenLoggingOut();

    this.props.history.push({
      pathname:'/',
    })
  }

  handleCreateButton() {
    // if (this.props.loggedIn) {
    if (this.state.loggedIn) {
      this.props.history.push({
        pathname: '/create/',
        state: {loggedIn: this.props.loggedIn, credentials: this.credentials, plus_code: this.props.plus_code}
      })
    } else {
      ReactDOM.render(
        <Provider store={store}>
          <div id="modal">
            <Modal history={this.props.history} plus_code={this.props.plus_code}/>
          </div>
        </Provider>,
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
            <MapViewButton onClick={this.handleMapViewonClick.bind(this)} loggedIn={this.state.loggedIn} />
            <CreateEventButton onClick={this.handleCreateButton.bind(this)} loggedIn={this.state.loggedIn} />
            <ProfileButtonNav onClick={this.handleProfileButtonClick.bind(this)} loggedIn={this.state.loggedIn} credentials={this.props.credentials} />
            <LoginButtonNav onClick={this.handleLoginButtonClick.bind(this)} loggedIn={this.state.loggedIn} />
            <LogOutButton onClick={this.handleLogoutButton.bind(this)} loggedIn={this.state.loggedIn} />
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

const ConnectedTopNavbar = connect(
  mapStateToProps,
  mapDispatchToProps
)(TopNavbar);

export default ConnectedTopNavbar;
