import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Script from 'react-load-script';
import { Form } from 'react-bootstrap';
import { changeMapState } from "../actions/index";
import { connect } from "react-redux";
import PopUp from './PopUp';

/* global google */

// initialize global constant values
const url = "https://maps.googleapis.com/maps/api/js?key=" + process.env.REACT_APP_API_KEY + "&libraries=places";

const TYPES = ['university'];
const FIELDS = ['address_components', 'name', 'geometry', 'plus_code'];

const SELECT_PLACEHOLDER = "Enter university";
const PLACE_CHANGED_LISTENER = 'place_changed';
const AUTOCOMPLETE_ID = 'autocomplete';
const INVALID_LOCATION_ALERT = 'MapIT does not support this location.  Please choose another.';

function mapDispatchToProps(dispatch) {
  return {
    changeMapState: mapState => dispatch(changeMapState(mapState))
  };
}

const mapStateToProps = state => {
  return { articles: state.articles };
}

class Searchbar extends Component {
  constructor(props) {
    super(props);
    console.log(props);

    // initialize global variables that can change
    this.reduxState = this.props.articles[0];

    if (this.reduxState) {
      this.state = {
        loggedIn: this.reduxState.loggedIn,
        plusCode: this.reduxState.plusCode,
        credentials: this.reduxState.credentials,
        filter_choice: this.reduxState.filter_choice,
        isChecked: this.reduxState.isChecked
      }
    }

    // Searchbar will either have a style or a size
    this.SEARCHBAR_STYLE = this.props.style;
    this.SEARCHBAR_SIZE = this.props.size;

    this.autocomplete = null;

    this.handleScriptLoad = this.handleScriptLoad.bind(this);
    this.handlePlaceSelect = this.handlePlaceSelect.bind(this);
    this.updateReduxState = this.updateReduxState.bind(this);
    this.updateReduxStateValue = this.updateReduxStateValue.bind(this);
  }

  handleScriptLoad() {
    const searchbar = document.getElementById(AUTOCOMPLETE_ID);
    this.autocomplete = new google.maps.places.Autocomplete(searchbar, TYPES);
    this.autocomplete.setFields(FIELDS);
    this.autocomplete.addListener(PLACE_CHANGED_LISTENER, this.handlePlaceSelect);
  }

  async handlePlaceSelect() {
    const addressObject = this.autocomplete.getPlace();
    const address = addressObject.address_components;
    const addressGeometry = addressObject.geometry;
    const validPlusCode = typeof addressObject.plus_code != 'undefined';

    if (address && validPlusCode) {
      this.updateReduxState(addressObject, addressGeometry, addressObject.plus_code.global_code);
      if (this.props.rerenderParentCallback) {
        this.props.rerenderParentCallback();
      }
    } else {
      ReactDOM.render(
        <div>
          <PopUp 
            show={true}
            onHide={this.hidePopUp.bind(this)}
            message={INVALID_LOCATION_ALERT}/>
        </div>
      );
      document.getElementById('popup-wrapper');
    }
  }

  hidePopUp() {
    const modal = document.getElementById('popup-wrapper');
    ReactDOM.unmountComponentAtNode(modal);
  }

  async updateReduxState(addressObject, addressGeometry, plus_code_global_code) {
    this.updateReduxStateValue();
    this.setState(this.reduxState);
    const updatedState = {
      location: addressGeometry.location,
      lat: addressGeometry.location.lat(),
      lng: addressGeometry.location.lng(),
      locationObject: addressObject,
      plusCode: plus_code_global_code,
      loggedIn: this.state.loggedIn,
      credentials: this.state.credentials,
      filter_choice: this.state.filter_choice,
      isChecked: this.state.isChecked
    };
    await this.props.changeMapState(updatedState);
    this.updateReduxStateValue();
    this.setState(updatedState);
  }

  updateReduxStateValue() {
    this.reduxState = this.props.articles[0];
  }

  render() {
    if (this.SEARCHBAR_STYLE) {
      return (
        <div>
          <Script
            url={url}
            onLoad = {this.handleScriptLoad}/>
            <Form>
              <Form.Control
                style={this.SEARCHBAR_STYLE}
                id={AUTOCOMPLETE_ID}
                placeholder={SELECT_PLACEHOLDER}/>
            </Form>
        </div>
      );
    } else if (this.SEARCHBAR_SIZE) {
      return (
        <div>
          <Script
            url={url}
            onLoad = {this.handleScriptLoad}/>
            <Form>
              <Form.Control
                size={this.SEARCHBAR_SIZE}
                id={AUTOCOMPLETE_ID}
                placeholder={SELECT_PLACEHOLDER}/>
            </Form>
        </div>
      );
    } else {
      // unreachable statement
      return (
        <div>
          <Script
            url={url}
            onLoad = {this.handleScriptLoad}/>
            <Form>
              <Form.Control
                id={AUTOCOMPLETE_ID}
                placeholder={SELECT_PLACEHOLDER}/>
            </Form>
        </div>
      );
    }
  }
}

const ConnectedSearchbar = connect(
  mapStateToProps,
  mapDispatchToProps
)(Searchbar);

export default ConnectedSearchbar;
