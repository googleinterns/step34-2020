import React, { Component } from 'react';
import { Map, GoogleApiWrapper } from 'google-maps-react';
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
  constructor() {
    super();
    this.state = {
      allEvents: [],
    };
  }

  // Queries all events with a given university plus code
  queryEventsAndStoreInMemory() {
    const eventsRef = fb.eventsRef;
    eventsRef.child("university").child("PUT_PLUS_CODE_HERE").child("All").on("value", function(dataSnapshot) {
      this.updateEventIdsAndLoadEvent(dataSnapshot.getVal());
    });
  }

  // Updates the allEvents map with the given eventId. Listens for changes from the eventId.
  updateEventIdsAndLoadEvent(eventId) {
    // Events reference
    const eventsRef = fb.eventsRef;
    // Query and then listen for any changes of that event
    eventsRef.child("events").child(eventId).on("value", function(dataSnapshot) {
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

  render() {
    return (
      <div>
        {this.props.articles.map(article => {
          return (
            <Map
              key={article.toString()}
              google={this.props.google}
              zoom={17}
              style={mapStyles}
              initialCenter={{
                lat: article.location.lat(),
                lng: article.location.lng()
              }}
              center={{
                lat: article.location.lat(),
                lng: article.location.lng()
              }}
              gestureHandling={'none'}
              zoomControl={false}
            />
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
