import React from 'react';

class Auth extends React.Component {
  constructor() {
    super();

    this.state = {
      authenticated: false
    }
  }

  login() {
    // connect to the serve
    // If user successfully logged in then
    //this.state.authenticated = true;
    this.state = {
      authenticated: true
    }
  }

  logout() {
    this.state.authenticated= false;
  }

  isAuthenticated() {
    return this.state.authenticated;
  }
}

export default Auth;
