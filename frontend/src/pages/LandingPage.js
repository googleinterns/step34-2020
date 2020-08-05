import React, { Component } from 'react';
import Welcome from '../components/Welcome';
import TopNavbar from '../components/Navbar'

class LandingPage extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <Welcome history={this.props.history}/>
      </div>
    );
  }
}

export default LandingPage;
