import React, { Component } from 'react'
import Script from 'react-load-script';
import TopNavbar from '../components/Navbar';
import MapView from '../components/MapView';
import { Form } from 'react-bootstrap';
import { changeMapState } from "../actions/index";
import { connect } from "react-redux";
import { GoogleApiWrapper } from 'google-maps-react';

function mapDispatchToProps(dispatch) {
  return {
    changeMapState: mapState => dispatch(changeMapState(mapState))
  };
}

const mapStateToProps = state => {
  return { articles: state.articles };
}

class MapViewPage extends Component {
  constructor(props) {
    super(props);
    this.handleScriptLoad = this.handleScriptLoad.bind(this);
    this.handlePlaceSelect = this.handlePlaceSelect.bind(this);

    this.types = ['university'];
    this.autocomplete = null;

    // Declare state
    this.state = {
      query: null,
      location: null,
      viewport: null,
      history: props.history,
      loggedIn: props.location.state.loggedIn
    };

    console.log(props);
  }

  render() {
    return (
      <div>
        <Script url = "https://maps.googleapis.com/maps/api/js?key=KEY&libraries=places" onLoad = {this.handleScriptLoad}/> 
        <TopNavbar history={this.props.history} loggedIn={this.state.loggedIn}/>
        <Form>
          <Form.Group>
          <Form.Label> Enter your university </Form.Label>
          <br />
          <Form.Control id = "autocomplete" placeholder = "Enter university"/>
          </Form.Group>
        </Form>
        <MapView />
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
    const addressGeometry = addressObject.geometry;

    if (address) {
      const currentState = {
        query: addressObject.formatted_address,
        location: addressGeometry.location,
        viewport: addressGeometry.viewport,
      }
      console.log(currentState);
      this.props.changeMapState(currentState);

      this.setState(currentState);
    }
  }
}

const ConnectedMapViewPage = connect(
  mapStateToProps,
  mapDispatchToProps
)(MapViewPage);

export default GoogleApiWrapper({
  apiKey: 'KEY'
})(ConnectedMapViewPage);
