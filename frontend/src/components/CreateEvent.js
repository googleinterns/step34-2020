import React, { Component } from 'react'
import TopNavbar from './Navbar';

class Create extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return(
      <div>
        <TopNavbar history={this.props.history} loggedIn={this.props.location.state.loggedIn}/>
        <h1>Hello</h1>
      </div>
    );
  }
}

export default Create;