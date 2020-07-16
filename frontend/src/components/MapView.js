import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Map, GoogleApiWrapper, Marker, InfoWindow } from 'google-maps-react';
import { fb } from '../App';
import { connect } from "react-redux";

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
      renderBoxes: [],
      infoBoxes: [],
      allEvents: [],
    };
  }

  componentDidMount() {
    this.queryEventsAndStoreInMemory();
  }

  // Queries all events with a given university plus code
  queryEventsAndStoreInMemory() {
    const eventsRef = fb.eventsRef;
    eventsRef.child("university").child("86GR2X49+PQ").child("All").orderByKey().on("value", (dataSnapshot) => {
      this.updateEventIdsAndLoadEvent(Object.values(dataSnapshot.val())[0]);
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
	this.state.allEvents.push({
	  key: eventId,
	  value: event
	});
	this.addInfoBoxEvent(event);
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
  }

  addInfoBoxEvent(event) {
    var location = this.getCoords(event.location);
    var lat = location[0];
    var lng = location[1];
    this.state.infoBoxes.push(
      <Marker
	title={event.eventName}
	id={event.eventId}
	position={{lat: lat, lng:lng}}
	draggable={false}
	>
	<InfoWindow
	  visible={true}
	  >
      	  <div>
      	    <h2>{event.eventName}</h2>
      	  </div>
	</InfoWindow>
      </Marker>
    );
    this.setState({
      renderBoxes: this.state.infoBoxes
    });
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
      coords = location.split(",");
    }
    return coords;
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
              style={mapStyles}
              initialCenter={{
                lat: article.location.lat(),
                lng: article.location.lng()
              }}
              gestureHandling={'cooperative'}
              zoomControl={true}
              >
	      {this.state.infoBoxes.map(element => element)}
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
