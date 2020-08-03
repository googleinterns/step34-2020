import React, { Component } from 'react'
import Script from 'react-load-script';
import TopNavbar from '../components/Navbar';
import MapView from '../components/MapView';
import MapViewSidePanel from '../components/MapViewSidePanel';
import { changeMapState } from "../actions/index";
import { connect } from "react-redux";
import { GoogleApiWrapper } from 'google-maps-react';

// initialize global constant values
const url = "https://maps.googleapis.com/maps/api/js?key=" + process.env.REACT_APP_API_KEY + "&libraries=places";
const types = ['university'];
const MAPVIEW_STYLE = {
  zIndex: 1
};

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

    // initialize global variables that can change 
    this.reduxState = this.props.articles[0];
    this.isChecked = false;
    this.autocomplete = null;

    this.handleScriptLoad = this.handleScriptLoad.bind(this);
    this.handlePlaceSelect = this.handlePlaceSelect.bind(this);
    this.inputRef = React.createRef();

    if (this.reduxState) {
      this.state = {
        location: this.reduxState.location,
        lat: this.reduxState.lat,
        lng: this.reduxState.lng,
        loggedIn: this.reduxState.loggedIn,
        plusCode: this.reduxState.plusCode,
        credentials: this.reduxState.credentials,
      };
    } else {
      window.location = "/";
    }
  }

  render() {
    return (
      <div>
        <Script
          url={url}
          onLoad = {this.handleScriptLoad}/>
        <TopNavbar history={this.props.history}/>
        <MapViewSidePanel />
        <MapView 
          style={MAPVIEW_STYLE}
          plusCode={this.state.plusCode}/>
      </div>
    );
  }

  handleScriptLoad() {
    /*global google*/
    this.autocomplete = new google.maps.places.Autocomplete(document.getElementById('autocomplete'), types);

    this.autocomplete.setFields(['address_components', 'name', 'geometry', 'plus_code']);
    this.autocomplete.addListener('place_changed', this.handlePlaceSelect);
  }

  async handlePlaceSelect() {
    const addressObject = this.autocomplete.getPlace();
    const address = addressObject.address_components;
    const addressGeometry = addressObject.geometry;

    if (address && typeof addressObject.plus_code != 'undefined') {
      const newState = {
        location: addressGeometry.location,
        lat: addressGeometry.location.lat(),
        lng: addressGeometry.location.lng(),
        locationObject: addressObject,
        plusCode: addressObject.plus_code.global_code,
        loggedIn: this.state.loggedIn,
        credentials: this.state.credentials,
        filter_choice: this.state.filter_choice,
        isChecked: this.isChecked
      }
      await this.props.changeMapState(newState);
      this.reduxState = this.props.articles[0];
      this.setState(newState);
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
