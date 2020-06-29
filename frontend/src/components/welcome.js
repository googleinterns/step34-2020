import React, { Component } from 'react';
import Script from 'react-load-script';
import { Form, Button, Jumbotron } from 'react-bootstrap'

class Search extends Component {
  // Define Constructor
  constructor(props) {
    super(props);
    this.handleScriptLoad = this.handleScriptLoad.bind(this);
    this.handlePlaceSelect = this.handlePlaceSelect.bind(this);

    this.types = ['university'];
    this.autocomplete = null;

    // Declare State
    this.state = {
      query: '',
      location: '',
      viewport: '',
    };
  }

  render() {
    return ( 
      <div>
        <Script url = "https://maps.googleapis.com/maps/api/js?key=KEY&libraries=places" onLoad = {this.handleScriptLoad}/> 
        <Jumbotron >
          <h1> Welcome to MapIT! </h1> 
          <Form>
            <Form.Group>
            <Form.Label> Enter your university </Form.Label> 
            <br/>
            <Form.Control id = "autocomplete" placeholder = "Enter university"/>
            </Form.Group> 
            <br/>
            <Button variant = "primary" type = "submit">Find Events</Button>
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
  }

  handlePlaceSelect() {
    const addressObject = this.autocomplete.getPlace();
    const address = addressObject.address_components;

    if (address) {
      this.setState({
        query: addressObject.geometry,
        location: addressObject.geometry.location,
        viewport: addressObject.geometry.viewport,
      });
    }
  }
}

export default Search;