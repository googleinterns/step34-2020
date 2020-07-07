import React from 'react';

class Auth extends React.Component {
  constructor() {
    super();

    this.state = {
      authenticated: true
    }
  }

  login() {
    // connect to the serve
    // If user successfully logged in then
    this.authenticated = true;
    // return that they failed
  }

  logout() {
    this.authenticated = false;
  }

  isAuthenticated() {
    return this.authenticated;
  }
}

export default new Auth();
