import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Card } from 'react-bootstrap';
import { Map, GoogleApiWrapper, } from 'google-maps-react';
import { fb } from '../App';
import { connect } from "react-redux";
import EventInfoWindow from "./EventInfoWindow";
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

    this.reduxState = this.props.articles[0];

    if (this.reduxState) {
      this.state = {
        allEvents: [],
        location: this.reduxState.location,
        lat: this.reduxState.lat,
        lng: this.reduxState.lng,
        plusCode: this.reduxState.plusCode,
        showInfoWindows: true,
        contents: null,
        resizeState: false,
        maxWidth: 100
      };
    } else {
      this.state = {
        allEvents: [],
        location: undefined,
        plusCode: '',
        showInfoWindows: false,
        contents: null,
        resizeState: false,
        maxWith: 100
      };
    }

    var plusCode = this.state.plusCode;

    document.addEventListener('domready', () => {
      document.querySelector('.gm-style-iw').addEventListener('click', this.printSomething);
    });

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
              lat: article.lat,
              lng: article.lng
            }}
            center={{
              lat: article.lat,
              lng: article.lng
            }}
            zoomControl={true}
          >
        {this.state.allEvents.map((element, index) => {
          return (this.getInfoBox(element, index));
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
          }));
          this.forceUpdate();
        }
    });
  }

  // Updates the event info box and updates the map in memory
  updateEvent(eventId, event) {
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

  getInfoBox(event, index) {
    if(event != null) {
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
        <EventInfoWindow
          key={index}
          visible={this.state.showInfoWindows}
          position={{lat: lat, lng: lng}}>
          <Card border="light" tag="a" onClick={this.printSomething.bind(this)} style={{minWidth: this.state.maxWidth, backgroundColor: 'lightgreen', display: 'flex', cursor: 'pointer'}}>
            <Card.Img variant="right" src={imageUrl} />
              <Card.Body>
                <Card.Title>{event.eventName}</Card.Title>
                <Card.Text>{event.description}</Card.Text>
                <Card.Text>{event.locationName}</Card.Text>
                <Card.Text>{event.startTime}</Card.Text>
                <Card.Text>{event.endTime}</Card.Text>
                <Card.Text>{event.date}</Card.Text>
              </Card.Body>
          </Card>
        </EventInfoWindow>
      );
    }
  }

  printSomething() {
    if (!this.state.resizeState) {
      this.setState({
        maxWidth: 600,
        resizeState: true,
      })
      console.log("true");
    } else {
      this.setState({
        maxWidth: 240,
        resizeState: false,
      })
      console.log("false");
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
      <div className="mapView" id="map-view">
      </div>
    )
  }
}


const ConnectMapViewToStore = connect(mapStateToProps);

export default GoogleApiWrapper({
  apiKey: process.env.REACT_APP_API_KEY
})(ConnectMapViewToStore(MapView));
