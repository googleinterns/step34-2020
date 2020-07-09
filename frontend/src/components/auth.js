import React from 'react';

class Auth extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      authenticated: false,
      credentials: null,
    }
  }

  login() {
    this.setState ({
      authenticated: true
    })
  }

  setCredentials(props) {
    this.setState({
      credentials: props
    })
  }

  getCredentials() {
    return this.state.credentials;
  }

  logout() {
    this.setState ({
      authenticated: false
    })
  }

  isAuthenticated() {
    return this.state.authenticated;
  }
}

export default Auth;
