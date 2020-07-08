import React from 'react';

class Auth extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      authenticated: false
    }
  }

  login() {
    this.setState ({
      authenticated: true
    })
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
