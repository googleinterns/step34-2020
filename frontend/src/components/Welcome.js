import React, { Component } from 'react';
import Script from 'react-load-script';
import { Form, Button, Jumbotron } from 'react-bootstrap';
import { changeMapState } from "../actions/index";
import { connect } from "react-redux";
import TopNavbar from './Navbar';
import '../App.css';

const url = "https://maps.googleapis.com/maps/api/js?key=" + process.env.REACT_APP_API_KEY + "&libraries=places";

function mapDispatchToProps(dispatch) {
  return {
    changeMapState: mapState => dispatch(changeMapState(mapState))
  };
}

class Search extends Component {
  // Define Constructor.
  constructor(props) {
    super(props);
    this.handleScriptLoad = this.handleScriptLoad.bind(this);
    this.handlePlaceSelect = this.handlePlaceSelect.bind(this);
    this.handleButtonClick = this.handleButtonClick.bind(this);

    this.types = ['university'];
    this.autocomplete = null;

    // Declare State
    this.state = {
      query: null,
      location: null,
      loggedIn: false,
      plusCode: null
    };
  }
  
  render() {
    return ( 
      <div className="welcomeContent">
        <Script url={url} onLoad={this.handleScriptLoad}/> 
        <TopNavbar loggedIn={this.state.loggedIn} history={this.props.history}/>
        <Jumbotron >
          <h1> Welcome to MapIT! </h1> 
          <Form>
            <Form.Group>
            <Form.Label> <h4>Our Mission</h4> </Form.Label>
      	    <br/>
            <Form.Label>The objective of MapIT is to manage and visualize student-created public events, and expose these events to their college community. <br />
              We are here to help you explore campus events beyond your social circle.</Form.Label> <br/><br/>
            <Form.Label> Enter your university </Form.Label> 
            <br/>
            <Form.Control id = "autocomplete" placeholder = "Enter university"/>
            <Form.Text id="text-muted"></Form.Text>
            </Form.Group> 
            <br/>
            <Button variant = "primary" type = "submit" onClick = {this.handleButtonClick}>Find Events</Button>
          </Form> 
        </Jumbotron>
      </div>
    );
  }

  handleScriptLoad() {
    /*global google*/
    this.autocomplete = new google.maps.places.Autocomplete(document.getElementById('autocomplete'), this.types);

    this.autocomplete.setFields(['address_components', 'name', 'geometry', 'plus_code']);
    this.autocomplete.addListener('place_changed', this.handlePlaceSelect);
  }

  handlePlaceSelect() {
    const addressObject = this.autocomplete.getPlace();
    const address = addressObject.address_components;
    const addressGeometry = addressObject.geometry;

    if (address) {
      const currentState  = {
        query: addressObject.name,
        location: addressGeometry.location,
        locationObject: addressObject,
        plusCode: addressObject.plus_code.global_code,
        loggedIn: this.state.loggedIn
      }
      this.props.changeMapState(currentState);
      this.setState(currentState);
    }
  }

  handleButtonClick(event) {
    var mutedText = document.getElementById('text-muted');
    if (this.state.query == null) {
      mutedText.innerHTML = 'Please select your university from the drop-down menu.';
      event.preventDefault();
    } else {
      event.preventDefault();
      // send login status and plus code status to the redux state
      this.props.history.push({
        pathname: '/map',
        state: {loggedIn: this.state.loggedIn, plus_code: this.plus_code}
      });
    }
  }
}

const ConnectedSearch = connect(
  null,
  mapDispatchToProps
)(Search);

export default ConnectedSearch;
