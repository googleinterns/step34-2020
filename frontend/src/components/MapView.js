import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { ButtonToolbar, Badge, Button, Card, Carousel, Row, Col, Image } from 'react-bootstrap';
import { Map, GoogleApiWrapper, } from 'google-maps-react';
import { fb } from '../App';
import { connect } from "react-redux";
import EventInfoWindow from "./EventInfoWindow";
import '../gm-styles.css';
import '../App.css';
import moment from 'moment';
import PlaceIcon from '@material-ui/icons/Place';
import AccessTimeIcon from '@material-ui/icons/AccessTime';
import GroupIcon from '@material-ui/icons/Group';

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
      renderedEvents: [],
      location: undefined,
      plusCode: props.plusCode,
      showInfoWindows: true,
      contents: null,
      resizeState: false,
      centerLat: "",
      centerLng: ""
    };

    this.mapRef = React.createRef();

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
    this.renderInfo();
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
    var map = "";
    this.props.articles.map(article => {
      this.state.centerLat = article.location.lat();
      this.state.centerLng = article.location.lng();
      map = (
	<Map
	  ref={this.mapRef}
	  id="map"
	  key={article.toString()}
	  google={this.props.google}
	  zoom={17}
	  onReady={this.onReady}
	  style={mapStyles}
	  initialCenter={{
	    lat: this.state.centerLat,
	    lng: this.state.centerLng
	  }}
	  center={{
	    lat: this.state.centerLat,
	    lng: this.state.centerLng
	  }}
	  zoomControl={true}>
	  {this.state.allEvents.map((element, index) => {
	    return (this.getInfoBox(element, index));
	  })}
	</Map>
      );
    })

    ReactDOM.render(
      map, document.getElementById("map-view")
    );
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
    // Update event info box
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

      var images = "";
      var length = 0;
      var imageUrl = "";
      if (event.imageUrls !== undefined) {
        length = event.imageUrls.length;
      }

      if (length > 0) {
        imageUrl = event.imageUrls.slice(1, length - 2);
        imageUrl = imageUrl.split(","); 
	images = imageUrl.map(url =>
            <Carousel.Item>
              <Image className="rounded" fluid src={url} />
            </Carousel.Item>);
      }

      let startTime = moment(event.startTime, 'HH:mm').format('h:mm a');
      let endTime = moment(event.endTime, 'HH:mm').format('h:mm a');
      let date = moment(event.date, 'YYYY-MM-DD').format('MMM  Do');

      var eventInfoWindow = (
        <EventInfoWindow
          key={index}
          visible={this.state.showInfoWindows}
          position={{lat: lat, lng: lng}}>
          <Card
	    border="light"
	    tag="a"
	    onClick={this.infoWindowOnClick.bind(this, index)}
	    style={{cursor: 'pointer'}}>
	    <Card.Body>
	      <Card.Title>{event.eventName}</Card.Title>
	      <hr/>
	      <Card.Text> 
		<PlaceIcon/>
		{event.locationName}
	      </Card.Text> 
	      <Card.Text> 
		<AccessTimeIcon/>
		{date}, {startTime} - {endTime}
	      </Card.Text>
	      <Badge variant="secondary">
		{event.category}
	      </Badge>
	      <hr/>
	    </Card.Body>
          </Card>
        </EventInfoWindow>
      );

      this.state.renderedEvents.push({
	key: index,
	value: eventInfoWindow, 
      });
      return eventInfoWindow;
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

  infoWindowOnClick(index) {
    let event = this.state.allEvents[index];
    let coords = this.getCoords(event.location);
    this.setState({
      centerLat: coords[0],
      centerLng: coords[1]
    });
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
