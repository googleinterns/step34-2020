import React, { Component } from 'react';
import Script from 'react-load-script';
import { Form, Button, Jumbotron } from 'react-bootstrap';
import { changeMapState } from "../actions/index";
import { connect } from "react-redux";
import TopNavbar from './Navbar';
import 'animate.css';
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
    this.plus_code = "";

    // Declare State
    this.state = {
      query: null,
      location: null,
      viewport: null,
      loggedIn: false
    };
  }
  
  render() {
    return ( 
      <div className="welcomeContent">
        <Script url = {url} onLoad = {this.handleScriptLoad}/> 
        <TopNavbar loggedIn={this.state.loggedIn} history={this.props.history}/>
        <Jumbotron>
          <h1 class="title animate__animated animate__fadeInDown">
	    <span style={{color: "#4486F4"}}>M</span>
	    <span style={{color: "#0096EF"}}>a</span>
	    <span style={{color: "#00BDD3"}}>p</span>
	    <span style={{color: "#04D064"}}>I</span>
	    <span style={{color: "#1CA45C"}}>T</span>
      	  </h1>
          <br/>
          <Form>
            <Form.Group>
      	    <Form.Label class="subtitle">Find an event with a click of <br /> a button</Form.Label>
            <br/>
      	    <Form.Label class="subtitle1"> 
	      <span style={{color: "#0096EF"}}>Find. </span>
	      <span style={{color: "#EA4335"}}>Create. </span>
	      <span style={{color: "#1CA45C"}}>Share.</span>
	    </Form.Label>
      	    <br/>
      	    <br/>
      	    <br/>
            <Form.Control style={{width: "50%"}} size="lg" id = "autocomplete" placeholder = "Enter university"/>
            <Form.Text id="text-muted"></Form.Text>
            </Form.Group> 
            <br/>
      	    <Button 
      	      variant="primary" 
              type="submit" 
      	      className="findeventbutton"
              onClick={this.handleButtonClick}>
      		Launch MapIT
      	    </Button>
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
        viewport: addressGeometry.viewport,  
      }
      console.log(currentState);
      this.props.changeMapState(currentState);
      this.plus_code = addressObject.plus_code.global_code;
      console.log(addressObject.plus_code.global_code);

      this.setState(currentState);
    }
  }

  handleButtonClick(event) {
    var mutedText = document.getElementById('text-muted');
    if (this.state.viewport == null) {
      mutedText.innerHTML = 'Please select your university from the drop-down menu.';
      event.preventDefault();
    } else {
      event.preventDefault();
    //   this.props.history.push('/map/');
      console.log(this.plus_code);
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
