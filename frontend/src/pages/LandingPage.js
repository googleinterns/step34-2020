import React, { Component } from 'react';
import Welcome from '../components/Welcome';
import TopNavbar from '../components/Navbar'
import { Router} from 'react-router-dom';

class LandingPage extends Component {
  constructor(props) {
    super(props);
  }

    render() {
      return (
          <div>
        <Router history={this.props.history}>
          <TopNavbar />
          <Welcome />
        </Router>
        </div>
      );
    }
}

export default LandingPage;