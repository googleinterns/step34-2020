import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Card } from 'react-bootstrap';
import { Map, GoogleApiWrapper, Marker, InfoWindow } from 'google-maps-react';
import { fb } from '../App';
import { connect } from "react-redux";
import '../gm-styles.css'
import { async } from '@firebase/util';

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
      location: undefined,
      plusCode: props.plusCode,
      showInfoWindows: true
    };
    var plusCode = this.state.plusCode;
    this.queryEventsAndStoreInMemory(plusCode);
    this.renderInfo = this.renderInfo.bind(this);
  }

  async UNSAFE_componentWillReceiveProps(nextProps) {
    await this.setState({ showInfoWindows: false, allEvents: [], plusCode: nextProps.plusCode }, async () => {
      await this.queryEventsAndStoreInMemory(nextProps.plusCode);
      await this.setState({showInfoWindows: true});
    });
  }

  // Whenever component is updated, we need to re-render again
  componentDidUpdate() {
    this.renderInfo()
  }

  handleShowWindow() {
    this.setState({showInfoWindows: true})
  }

  async componentDidMount() {
    await this.queryEventsAndStoreInMemory(this.props.plusCode);
    await this.handleShowWindow()
    await this.renderInfo()
  }

  renderInfo () {
    console.log(this.state.allEvents)
    ReactDOM.render(
    this.props.articles.map(article => {
      return (
        <Map
          id="map"
            key={article.toString()}
            google={this.props.google}
            zoom={17}
          onReady={this.onReady}
            style={mapStyles}
            initialCenter={{
              lat: article.location.lat(),
              lng: article.location.lng()
            }}
            center={{
              lat: article.location.lat(),
              lng: article.location.lng()
            }}
            zoomControl={true}
          >
        {this.state.allEvents.map(element => {
          return (this.getInfoBox(element));
        })}
      </Map>
      )
    }), document.getElementById('map-view') )
  }

  // Queries all events with a given university plus code
  queryEventsAndStoreInMemory(plusCode) {
    if (plusCode !== undefined) {
      const eventsRef = fb.eventsRef;
      eventsRef.child("university").child(plusCode).child("All").orderByKey().on("value", (dataSnapshot) => {
        if (dataSnapshot.numChildren() !== 0) {
          var events = Object.values(dataSnapshot.val());
          for (var i = 0; i < events.length; i++) {
            this.updateEventIdsAndLoadEvent(events[i]);
          }
        }
      });
    } else {
      const eventsRef = fb.eventsRef;
      eventsRef.child("university").child("8QC7XP32+PC").child("All").orderByKey().on("value", (dataSnapshot) => {
        if (dataSnapshot.numChildren() !== 0) {
          var events = Object.values(dataSnapshot.val());
          for (var i = 0; i < events.length; i++) {
            this.updateEventIdsAndLoadEvent(events[i]);
          }
        }
      });
    }
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

  loadArticle(article) {
    if (article.locationObject) {
      this.plusCodeGlobalCode = article.locationObject.plus_code.global_code;
      this.setState({allEvents: []});
    }
  }

  addInfoBoxEvent(event) {
    return this.getInfoBox(event);
  }

  getInfoBox(event) {
    if(event != null) {
      console.log("infobox");
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
      <div  className="mapView" id="map-view">
      </div>
    )
  }

}

const ConnectMapViewToStore = connect(mapStateToProps);

export default GoogleApiWrapper({
  apiKey: process.env.REACT_APP_API_KEY
})(ConnectMapViewToStore(MapView));
