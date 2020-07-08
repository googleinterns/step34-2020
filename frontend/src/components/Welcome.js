import React, { Component } from 'react';
import Script from 'react-load-script';
import { Form, Button, Jumbotron } from 'react-bootstrap';
import { changeMapState } from "../actions/index";
import { connect } from "react-redux";
import TopNavbar from './Navbar'

function mapDispatchToProps(dispatch) {
  return {
    changeMapState: mapState => dispatch(changeMapState(mapState))
  };
}

class Search extends Component {
  // Define Constructor
  constructor(props) {
    super(props);
    this.handleScriptLoad = this.handleScriptLoad.bind(this);
    this.handlePlaceSelect = this.handlePlaceSelect.bind(this);
    this.handleButtonClick = this.handleButtonClick.bind(this);
    this.handleStateUpdate = this.handleStateUpdate.bind(this);

    this.types = ['university'];
    this.autocomplete = null;

    // Declare State
    this.state = {
      query: null,
      location: null,
      viewport: null,
    };
  }
  
  render() {
    console.log(this.state.users)
    return ( 
      <div>
        <Script url = "https://maps.googleapis.com/maps/api/js?key=KEY&libraries=places" onLoad = {this.handleScriptLoad}/> 
        <TopNavbar />
        <Jumbotron >
          <h1> Welcome to MapIT! </h1> 
          <Form>
            <Form.Group>
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

    this.autocomplete.setFields(['address_components', 'formatted_address', 'geometry', 'adr_address']);
    this.autocomplete.addListener('place_changed', this.handlePlaceSelect);
    console.log(this.history);
  }

  handlePlaceSelect() {
    const addressObject = this.autocomplete.getPlace();
    const address = addressObject.address_components;
    const addressGeometry = addressObject.geometry;

    if (address) {
      this.setState({
        query: addressObject.formatted_address,
        location: addressGeometry.location,
        viewport: addressGeometry.viewport,
      });

      const currentState  = {
        query: addressObject.formatted_address,
        location: addressGeometry.location,
        viewport: addressGeometry.viewport,  
      }
      this.props.changeMapState(currentState);
    }
  }

  handleStateUpdate() {
    const { currentState } = this.state;
    this.props.changeMapState({ currentState });
  }

  handleButtonClick(event) {
    var mutedText = document.getElementById('text-muted');
    if (this.state.viewport == null) {
      mutedText.innerHTML = 'Please select your university from the drop-down menu.';
      event.preventDefault();
    } else {
      this.props.history.push('/map/');
    }
  }
}

const ConnectedSearch = connect(
  null,
  mapDispatchToProps
)(Search);

export default ConnectedSearch;
