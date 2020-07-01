import React from 'react';

class Auth extends React.Component {
  constructor() {
    super();

    this.state = {
      authenticated: false
    }
  }

  login(props) {
    // connect to the serve
    // If user successfully logged in then
    this.authenticated = true;
    console.log(props);
    // return that they failed
  }

  signup(props) {
    //handle signup
    console.log(props);
    this.authenticated = true;
  }

  logout() {
    this.authenticated = false;
  }

  isAuthenticated() {
    return this.authenticated;
  }
}

export default new Auth();