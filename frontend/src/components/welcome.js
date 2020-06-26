import React, { Component } from 'react';
import Script from 'react-load-script';
import { Form, Button, Jumbotron } from 'react-bootstrap'

class Search extends Component {
  
	// Define Constructor
	constructor(props) {
    	super(props);
        this.handleScriptLoad = this.handleScriptLoad.bind(this);

    	// Declare State
    	this.state = {
    		city: '',
    		query: ''
    	};

	}

  	render() {
    	return (
      	    <div>
    	    	<Script url="https://maps.googleapis.com/maps/api/js?key=KEY&libraries=places" onLoad={this.handleScriptLoad}/>
                <Jumbotron>
                	<h1>Welcome to MapIT!</h1>
                	<Form>
                		<Form.Group controlId="universityForm">
                    		<Form.Label>Enter your university</Form.Label>
                        	<br/>
                        	<Form.Control id="autocomplete" placeholder="Enter university" />
                    	</Form.Group>
                    	<br/>
                    	<Button variant="primary" type="submit">
                    		Find Events
                    	</Button>
                	</Form>
                </Jumbotron>
     		</div>
        );
  	}

    handleScriptLoad() { 
    	// Declare Options For Autocomplete 

        const types = ["university"];
  		// Initialize Google Autocomplete 
  		/*global google*/
    	var autocomplete = new google.maps.places.Autocomplete(document.getElementById('autocomplete'), types);
  
  		autocomplete.setFields(['address_components', 'formatted_address']);
  		autocomplete.addListener('place-changed', this.handlePlaceSelect); 
	}

    handlePlaceSelect() {
        const addressObject = this.autocomplete.getPlace();
        const address = addressObject.address_components;

        if (address) {
            this.setState(
                {
                    city: address[0].long_name,
                    query: addressObject.formatted_address,
                }
            );
        }
    }
}

export default Search;
