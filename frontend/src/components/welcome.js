import React, { Component } from 'react';
import SearchBar from 'material-ui-search-bar';
import Script from 'react-load-script';
import { PropTypes } from 'react';


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
    	    	<Script url="https://maps.googleapis.com/maps/api/js?key=AIzaSyCd-i8jSh6tWlO0pH0h0EfaLiywM_ilLXk&libraries=places" onLoad={this.handleScriptLoad}/>
                <SearchBar id="autocomplete" placeholder="" hintText="Enter your University" value={this.state.query}
          		style={{
            		margin: '0 auto',
            		maxWidth: 800,
          		}}/>
     		</div>
        );
  	}

    handleScriptLoad() { 
    	// Declare Options For Autocomplete 
  		// Initialize Google Autocomplete 
  		/*global google*/
        /*global autocomplete*/
    	var autocomplete = new google.maps.places.Autocomplete(document.getElementById('autocomplete'));
  
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


