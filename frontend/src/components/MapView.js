import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Card } from 'react-bootstrap';
import { Map, GoogleApiWrapper, Marker, InfoWindow } from 'google-maps-react';
import { fb } from '../App';
import { connect } from "react-redux";
import '../gm-styles.css'

const mapStateToProps = state => {
  return { articles: state.articles };
};

const mapStyles = {
  width: '100%',
  height: '100%'
};

class MapView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      allEvents: [],
      showInfoWindows: true
    };
    console.log("Constructing");
    this.queryEventsAndStoreInMemory();
  }

  // Queries all events with a given university plus code
  queryEventsAndStoreInMemory() {
    this.setState({allEvents: []});
    const eventsRef = fb.eventsRef;
    eventsRef.child("university").child("86GR2X49+PQ").child("All").orderByKey().on("value", (dataSnapshot) => {
      var events = Object.values(dataSnapshot.val());
      for (var i = 0; i < events.length; i++) {
	console.log(events[i]);
        this.updateEventIdsAndLoadEvent(events[i]);
      }
    });
  }

  // Updates the allEvents map with the given eventId. Listens for changes from the eventId.
  updateEventIdsAndLoadEvent(eventId) {
    // Events reference
    const eventsRef = fb.eventsRef;
    // Query and then listen for any changes of that event
    eventsRef.child("events").child(eventId).on("value", (dataSnapshot) => {
      // The event object
      const event = dataSnapshot.val();
      // If the state has the event then update the change
      if (this.state.allEvents[eventId] !== undefined) {
	this.updateEvent(eventId, event);
      } else {
	// If the state doesnt have the event, add the event to the map
	this.setState(prevState => ({
  	  allEvents: [...prevState.allEvents, event]
	}), () => {
	  this.forceUpdate();
	});
      }
    });
  }

  // Updates the event info box and updates the map in memory
  updateEvent(eventId, event) {
    // TODO: Update event info box
    this.state.allEvents.push({
      key: eventId,
      value: event
    }); 
    this.setState({
      allEvents: this.state.allEvents,
    });
  }

  addInfoBoxEvent(event) {
    return this.getInfoBox(event);
  }

  getInfoBox(event) {
    var location = this.getCoords(event.location);
    var lat = parseFloat(location[0]);
    var lng = parseFloat(location[1]);

    var length = 0;
    var imageUrl = "";
    if (event.imagePaths != null) {
      length = event.imagePaths.length;
    }

    if (length > 0) {
      imageUrl = event.imagePaths.slice(1, length - 2);
      imageUrl = imageUrl.split(",")[0];
    }
    console.log(imageUrl);
    return(
      <InfoWindow
	visible={this.state.showInfoWindows}
	position={{lat: lat, lng: lng}}>
	<Card border="light">
      	  <Card.Img variant="right" src={imageUrl} />
      	  <Card.Body>
      	    <Card.Title>{event.eventName}</Card.Title>
      	    <Card.Text>{event.description}</Card.Text>
      	  </Card.Body>
	</Card>
      </InfoWindow>
    );
  }

  // Gets coordinate from string of location. Element 0 is latitude and 1 is longitude
  getCoords(location) {
    var coords = "";
    var length = 0;
    if (location != null) {
     length = location.length;
    }
    if (length > 0) {
      coords = location.slice(1, length-2);
      coords = coords.split(",");
    }
    return coords;
  }

  onReady = () => {
    this.setState({
      showInfoWindows: true
    });
  }

  render() {
    return (
      <div>
        {this.props.articles.map(article => {
          return (
            <Map
	      id="map"
              key={article.toString()}
              google={this.props.google}
              zoom={17}
	      onReady={this.onReady}
              style={mapStyles}
              initialCenter={{
                lat: 39.9522188,
                lng: -75.1954024
              }}
              center={{
                lat: article.location.lat(),
                lng: article.location.lng()
              }}
              zoomControl={true}
             >
	      {this.state.allEvents.map(element => {
		console.log(element);
		return (this.getInfoBox(element));
	      })}
	    </Map>
          )
        })}
      </div>
    )
  }
}

const ConnectMapViewToStore = connect(mapStateToProps);

export default GoogleApiWrapper({
  apiKey: process.env.REACT_APP_API_KEY
})(ConnectMapViewToStore(MapView));
