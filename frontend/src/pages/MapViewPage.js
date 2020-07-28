import React, { Component } from 'react'
import Script from 'react-load-script';
import TopNavbar from '../components/Navbar';
import MapView from '../components/MapView';
import { Toast, Form, Container } from 'react-bootstrap';
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

    this.reduxState = this.props.articles[0];

    this.handleScriptLoad = this.handleScriptLoad.bind(this);
    this.handlePlaceSelect = this.handlePlaceSelect.bind(this);
    this.inputRef = React.createRef();

    this.types = ['university'];
    this.autocomplete = null;

    this.url = "https://maps.googleapis.com/maps/api/js?key=" + process.env.REACT_APP_API_KEY + "&libraries=places";

    if (this.reduxState) {
      this.state = {
        location: this.reduxState.location,
        lat: this.reduxState.lat,
        lng: this.reduxState.lng,
        loggedIn: this.reduxState.loggedIn,
        plusCode: this.reduxState.plusCode,
        credentials: this.reduxState.credentials
      };
    } else {
      window.location = "/";
    }

    console.log(this.state)
  }

  render() {
    return (
      <div>
        <Script grl = {this.url} onLoad = {this.handleScriptLoad}/> 
        <TopNavbar history={this.props.history} loggedIn={this.state.loggedIn} plus_code={this.state.plus_code}/>
	<Toast style={{position: "absolute", zIndex: 2, padding: "0rem", minWidth: "20rem", float: "right", margin: "1rem"}}>
	  <Toast.Body>	
	    <Form>
	      <Form.Group>
	      <br />
	      <Form.Control id = "autocomplete" placeholder = "Enter university"/>
	      </Form.Group>
	    </Form>
	  </Toast.Body>
	</Toast>	
        <MapView style={{zIndex: 1}}plusCode={this.state.plusCode}/>
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
    console.log(addressObject);

    if (address && typeof addressObject.plus_code != 'undefined') {
      const currentState = {
        location: addressGeometry.location,
        lat: addressGeometry.location.lat(),
        lng: addressGeometry.location.lng(),
        locationObject: addressObject,
        plusCode: addressObject.plus_code.global_code,
        loggedIn: this.state.loggedIn,
        credentials: this.state.credentials
      }
      this.props.changeMapState(currentState);
      this.setState(currentState);
    } else {
      alert('MapIT does not support this location.  Please choose another.');
    }
  }
}

const ConnectedMapViewPage = connect(
  mapStateToProps,
  mapDispatchToProps
)(MapViewPage);

export default GoogleApiWrapper({
  apiKey: process.env.REACT_APP_API_KEY
})(ConnectedMapViewPage);
