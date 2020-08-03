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

    this.rerenderParentCallback = this.rerenderParentCallback.bind(this);
    this.updateReduxStateValue = this.updateReduxStateValue.bind(this);
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
        <MapViewSidePanel rerenderParentCallback={this.rerenderParentCallback}/>
        <MapView 
          style={MAPVIEW_STYLE}
          plusCode={this.state.plusCode}/>
      </div>
    );
  }

  updateReduxStateValue() {
    this.reduxState = this.props.articles[0];
  }

  rerenderParentCallback() {
    this.updateReduxStateValue();
    this.setState(this.reduxState);
  }
}

const ConnectedMapViewPage = connect(
  mapStateToProps,
  mapDispatchToProps
)(MapViewPage);

export default GoogleApiWrapper({
  apiKey: process.env.REACT_APP_API_KEY
})(ConnectedMapViewPage);
