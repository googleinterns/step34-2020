import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Badge, Container, Card, Carousel, Row, Col, Image } from 'react-bootstrap';
import { Map, GoogleApiWrapper, } from 'google-maps-react';
import { fb } from '../App';
import { connect } from "react-redux";
import { Deferred } from '@firebase/util';
import EventInfoWindow from "./EventInfoWindow";
import '../gm-styles.css';
import '../App.css';
import moment from 'moment';
import PlaceIcon from '@material-ui/icons/Place';
import AccessTimeIcon from '@material-ui/icons/AccessTime';
import GroupIcon from '@material-ui/icons/Group';
import CheckCircleOutlinedIcon from '@material-ui/icons/CheckCircleOutlined';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import StarBorderIcon from '@material-ui/icons/StarBorder';


const mapStateToProps = state => {
  return { articles: state.articles };
};

const mapStyles = {
  width: '100%',
  height: '100%',
};

class MapView extends Component {
  constructor(props) {
    super(props);
    this.mapRef = React.createRef();

    this.reduxState = this.props.articles[0];
    
    if (this.reduxState) {
      this.state = {
        allEvents: [],
        renderedEvents: [],
        location: this.reduxState.location,
        lat: this.reduxState.lat,
        lng: this.reduxState.lng,
        plusCode: this.reduxState.plusCode,
        showInfoWindows: true,
        contents: null,
        resizeState: false,
        filter_choice: props.articles[0].filter_choice,
        isChecked: false
      };
    } else {
      this.state = {
        allEvents: [],
        renderedEvents: [],
        location: undefined,
        plusCode: '',
        showInfoWindows: false,
        contents: null,
        resizeState: false,
        filter_choice: props.articles[0].filter_choice,
        isChecked: false
      };
    }

    var plusCode = this.state.plusCode;
    this.renderInfo = this.renderInfo.bind(this);
  }

  async componentDidMount() {
    await this.setState({ allEvents: [] });
    await this.queryEventsAndStoreInMemory(this.state.plusCode);
    await this.initializeRender();
  }

  // Called whenever the props change (when the university, filter, or time today are changed)
  async UNSAFE_componentWillReceiveProps(nextProps) {
    // If the plus code changes, requery with the new plus code and wipe all event data currently on the map
    if (nextProps.plusCode !== this.state.plusCode) {
      await this.setState({ allEvents: [], plusCode: nextProps.plusCode });
      await this.queryEventsAndStoreInMemory(nextProps.plusCode);
      await this.initializeRender();
    }

    // Shows all the events
    this.showAllEvents();
    
    // If the filter has changed, set the state and handle filter changes
    if (nextProps.articles[0].filter_choice !== this.state.filter_choice) {
      await this.setState({ filter_choice: nextProps.articles[0].filter_choice });
      this.handleFilterChange();
    }

    // If the today's events is checked, set the state and handle filter changes
    if (nextProps.articles[0].isChecked) {
      await this.setState({ isChecked: nextProps.articles[0].isChecked });
      this.handleTimeTodayChange();
    }
  }

  // Initializes the render for whenever the map get loaded first or whenever the plus code props change
  async initializeRender() {  
    // Render the map with events twice
    // For some strange reason, whenever we dont call renderInfo a second time, the events wont show
    await this.setState({ renderedEvents: [] });
    this.renderInfo();
    await this.setState({ renderedEvents: [] });
    this.renderInfo();
  }

  // Shows all events
  showAllEvents() {
    this.state.renderedEvents.map((element) => {
      element.eventRef.current.show();
    });
  }

  // Checks if we need to show only today, if we do, hide all events that are not today
  handleTimeTodayChange() {
    const showTodayOnly = this.state.isChecked;
    if (showTodayOnly) {
      const today = new Date();
      this.state.allEvents.map((event, index) => {
        // event.date is YYYY-MM-DD
        //               0123456789
        const eventDate = event.date;
        const eventYear = eventDate.substring(0, 4);
        var eventMonth = eventDate.substring(5, 7);
        if (eventMonth.charAt(0) === '0'){
          eventMonth = eventMonth.substring(1, eventMonth.length);
        }
        const eventDay = eventDate.substring(8, 10);

        const todayYear = today.getFullYear().toString();
        const todayMonth = (today.getMonth() + 1).toString(); // months are 0-indexed
        const todayDay = today.getDate().toString();

        const yearsMatch = eventYear.valueOf() === todayYear.valueOf();
        const monthsMatch = eventMonth.valueOf() === todayMonth.valueOf();
        const daysMatch = eventDay.valueOf() === todayDay.valueOf();

        if (!(yearsMatch && monthsMatch && daysMatch)) {
          this.state.renderedEvents[index].eventRef.current.hide();
        }
      });
    }
  }

  // Handles when the filter changes. Hides all event infowindows that are not part of that category
  handleFilterChange() {
    const filter_choice =  this.state.filter_choice;
    if (filter_choice !== null && typeof filter_choice !== 'undefined') {
      this.state.allEvents.map((element, index) => {
        if (element.category.toLowerCase() !== (filter_choice).toLowerCase()) {
          this.state.renderedEvents[index].eventRef.current.hide();
        }
      });
    }
  }

  // Renders the map with the event info
  renderInfo () { 
    let container = document.getElementById('map-view') 
    var map = (
      <Map
        ref={(map) => this.mapRef = map}
        id="map"
        google={this.props.google}
        zoom={17}
        mapTypeControl={false}
        fullscreenControl={false}
        onReady={this.onReady}
        style={mapStyles}
        initialCenter={{
          lat: this.state.lat,
          lng: this.state.lng
        }}
        center={{
          lat: this.state.lat,
          lng: this.state.lng
         }}
        zoomControl={true}>
        {this.state.allEvents.map((element, index) => {
          return (this.getInfoBox(element, index));
        })}
       </Map>
    );

    ReactDOM.render(map, container);
  }

  // Queries all events with a given university plus code
  async queryEventsAndStoreInMemory(plusCode) {
    var deferred = new Deferred();
    if (plusCode !== undefined) {
      const eventsRef = fb.eventsRef;
      eventsRef.child("university").child(plusCode).child("All").orderByKey().on("value", async (dataSnapshot) => {
        if (dataSnapshot.numChildren() !== 0) {
          var events = Object.values(dataSnapshot.val());
          for (var i = 0; i < events.length; i++) {
            await this.updateEventIdsAndLoadEvent(events[i]);
          }
          deferred.resolve();
        }
      });
    } else {
      const eventsRef = fb.eventsRef;
      eventsRef.child("university").child("8QC7XP32+PC").child("All").orderByKey().on("value", async (dataSnapshot) => {
        if (dataSnapshot.numChildren() !== 0) {
          var events = Object.values(dataSnapshot.val());
          for (var i = 0; i < events.length; i++) {
            await this.updateEventIdsAndLoadEvent(events[i]);
          }
          deferred.resolve();
        }
      });
    }
    return deferred.promise;
  }

  // Updates the allEvents map with the given eventId. Listens for changes from the eventId.
  async updateEventIdsAndLoadEvent(eventId) {
    var deferred = new Deferred();
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
      }
      deferred.resolve();
    });

    return deferred.promise;
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
  
  getInfoBox(event, index) {
    if(event != null) {
      var location = this.getCoords(event.location);
      var lat = parseFloat(location[0]);
      var lng = parseFloat(location[1]);

      // Format time and dates to a more comfortable format
      let startTime = moment(event.startTime, 'HH:mm').format('h:mm a');
      let endTime = moment(event.endTime, 'HH:mm').format('h:mm a');
      let date = moment(event.date, 'YYYY-MM-DD').format('MMM  Do');

      var eventRef = React.createRef();

      var eventInfoWindow = (
        <EventInfoWindow
          key={index}
          index={index}
          ref={eventRef}
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
        eventRef
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

  // Handle when an info window is clicked
  infoWindowOnClick(index) {
    let event = this.state.allEvents[index];
    let coords = this.getCoords(event.location);

    // Change coords to parses and pan to the location
    var lat = parseFloat(coords[0]);
    var lng = parseFloat(coords[1]);
    let googleMapCoords = new this.mapRef.props.google.maps.LatLng(lat, lng);
    this.mapRef.map.panTo(googleMapCoords);

    // Render the side panel
    this.renderSidePanel(event);
  }

  renderSidePanel(event) {

    var images = "";
    var length = 0;

    // Check image urls are not undefined
    var imageUrl = "";
    if (event.imageUrls !== undefined) {
      length = event.imageUrls.length;
    }

    // Convert each image into a carousel item
    if (length > 0) {
      imageUrl = event.imageUrls.slice(1, length - 2);
      imageUrl = imageUrl.split(","); 
      images = imageUrl.map((url, index) =>
    <Carousel.Item key={index}>
      <Image className="rounded" fluid src={url} />
    </Carousel.Item>);
    }

    var attendees = event.attendees.slice(1, event.attendees.length-1).split(",");
    let num = attendees.length;

    let startTime = moment(event.startTime, 'HH:mm').format('h:mm a');
    let endTime = moment(event.endTime, 'HH:mm').format('h:mm a');
    let date = moment(event.date, 'YYYY-MM-DD').format('MMM  Do');
    var eventInfo = (
      <Container>
        <Card
          className="event-cards"
          key={Math.random(1001,5000)}
          text={'light' ? 'dark' : 'white'}>
          <Carousel className="fill-parent">
                  {images}
          </Carousel>
          <Card.Body>
            <Card.Title>
              <h1 className="event-cards-title">{event.eventName}</h1>
            </Card.Title>
            <div className="event-text">
              <Row>
                <Col xs={1}>
                  <PlaceIcon/>
                </Col>
                <Col>
                  {event.locationName}
                </Col>
              </Row>
            </div>
            <div>
              <Row>
                <Col xs={1}>
                  <AccessTimeIcon/>
                </Col>
                <Col>
                  {date}, {startTime} - {endTime}
                </Col>
              </Row>
            </div>
            <div>
              <Row>
                <Col xs={1}>
                  <GroupIcon/>
                </Col>
                <Col>
                  {num} attending
                </Col>
              </Row>
            </div>
            <hr/>
            <Card.Text className="event-cards-description">
              About
            </Card.Text>
            <Card.Text>{event.description}</Card.Text>
            <Badge variant="secondary">
              {event.category}
            </Badge>
            <hr/>
            <Row className="justify-content-md-center">
              <Col md="auto">
                {this.checkGoing(attendees)}
                <div className="event-cards-attendtext">Going</div>
              </Col>
              <Col md="auto">
                <StarBorderIcon style={{color: "#ffe733", padding: 0, fontSize: "60px"}}/>
                <div className="event-cards-attendtext">Interested</div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Container>
    );

    let eventInfoContainer = document.getElementById("event-info");
    ReactDOM.render(eventInfo, eventInfoContainer);
  }

  checkGoing(attendees) {
    if (this.reduxState.credentials === undefined) {
      return (<CheckCircleOutlinedIcon style={{color: "#1CA45C", padding: 0, fontSize: "60px"}}/>);
    }

    const uid = this.reduxState.credentials.uid;
    const found = attendees.find(element => element === uid);

    if (found === undefined) {
      return (<CheckCircleOutlinedIcon style={{color: "#1CA45C", padding: 0, fontSize: "60px"}}/>);
    } else {
      return (<CheckCircleIcon style={{color: "#1CA45C", padding: 0, fontSize: "60px"}}/>);
    }
  }


  onReady = () => {
    this.setState({
      showInfoWindows: true
    });
  }

  render() {
    return (
      <div className="mapView" id="map-view"></div>
    )
  }
}


const ConnectMapViewToStore = connect(mapStateToProps);

export default GoogleApiWrapper({
  apiKey: process.env.REACT_APP_API_KEY
})(ConnectMapViewToStore(MapView));
