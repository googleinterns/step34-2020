import React, { Component } from 'react'
import Script from 'react-load-script';
import TopNavbar from '../components/Navbar';
import MapView from '../components/MapView';
import { Form, Col } from 'react-bootstrap';
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
    this.handleFilter = this.handleFilter.bind(this);
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
        <Script url={this.url} onLoad={this.handleScriptLoad}/> 
        <TopNavbar history={this.props.history}/>
        <Form style={{marginLeft: '3rem', marginRight: '3rem'}}>
            <Form.Row>
              <Form.Group as={Col}>
                <Form.Label> Enter your university</Form.Label>
                <Form.Control id = "autocomplete" placeholder = "Enter university"/>
              </Form.Group>
              <Form.Group as={Col}>
                <Form.Label> Filter </Form.Label>
                <Form.Control
                    onChange={this.handleFilter}
                    as="select"
                    className="my-1 mr-sm-2"
                    id="categoriesSelect"
                    custom="true">
                    <option value="">Choose...</option>
                    <option value="0">Social Gathering</option>
                    <option value="1">Volunteer Event</option>
                    <option value="2">Student Organization Event</option>
                  </Form.Control>
              </Form.Group>
            </Form.Row>
          </Form>
        <MapView plusCode={this.state.plusCode}/>
      </div>
    );
  }

  handleFilter(input) {
    // Set filter category
    let filter_choice = null;
    switch (input.target.value) {
      case "0":
        filter_choice = "Social Gathering";
        break;

      case "1":
        filter_choice = "Volunteer Event";
        break;

      case "2":
        filter_choice = "Student Organization Event";
        break;

      default:
        break;
    }

    const newState = {
      location: this.state.location,
      lat: this.state.lat,
      lng: this.state.lng,
      locationObject:this.state.locationObject,
      plusCode: this.state.plusCode,
      loggedIn: this.state.loggedIn,
      credentials: this.state.credentials,
      filter_choice: filter_choice,
    }
    
    this.props.changeMapState(newState);
    this.setState(newState);
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
    // var mutedText = document.getElementById('text-muted');
    console.log(this.state.filter_choice)

    if (address && typeof addressObject.plus_code != 'undefined') {
      //mutedText.innerHTML = '';
      const newState = {
        location: addressGeometry.location,
        lat: addressGeometry.location.lat(),
        lng: addressGeometry.location.lng(),
        locationObject: addressObject,
        plusCode: addressObject.plus_code.global_code,
        loggedIn: this.state.loggedIn,
        credentials: this.state.credentials,
        filter_choice: this.state.filter_choice,
        
      }
      this.props.changeMapState(newState);
      this.reduxState = this.props.articles[0];
      this.setState(newState);
    } else {
      // mutedText.innerHTML = 'MapIT does not support this location.  Please choose another.';
      alert("MapIT does not support this location.  Please choose another.")
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
