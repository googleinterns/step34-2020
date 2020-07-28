import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Toast, ButtonToolbar, Badge, Button, ToggleButton, Container, Card, Carousel, Row, Col, Image } from 'react-bootstrap';
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
import CheckCircleOutlinedIcon from '@material-ui/icons/CheckCircleOutlined';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import StarBorderIcon from '@material-ui/icons/StarBorder';
import StarIcon from '@material-ui/icons/Star';

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
      };
    }

    var plusCode = this.state.plusCode;
    this.queryEventsAndStoreInMemory(plusCode);
    this.renderInfo = this.renderInfo.bind(this);
  }

  async UNSAFE_componentWillReceiveProps(nextProps) {
    this.props.articles.map(article => {
      this.setState({
      	lat: article.lat,
	lng: article.lng
      });
    })
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
    var listEvents = [];

    const filter_choice =  this.props.articles[0].filter_choice;

    if (filter_choice === null || typeof filter_choice === 'undefined') {
      listEvents = this.state.allEvents;
    } else {
      console.log("changed filter")
      listEvents = this.state.allEvents.filter((event) => {
        return event.category.toLowerCase() === (filter_choice).toLowerCase();
      });
    }

    let article = this.props.articles[0];
    let container = document.getElementById('map-view')
    
    //unmount the component so that we can render new data
    ReactDOM.unmountComponentAtNode(container)

    var map = (
      <Map
	ref={this.mapRef}
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

  getInfoBox(event, index) {
    if(event != null) {
      var location = this.getCoords(event.location);
      var lat = parseFloat(location[0]);
      var lng = parseFloat(location[1]);


      // Format time and dates to a more comfortable format
      let startTime = moment(event.startTime, 'HH:mm').format('h:mm a');
      let endTime = moment(event.endTime, 'HH:mm').format('h:mm a');
      let date = moment(event.date, 'YYYY-MM-DD').format('MMM  Do');

      var eventInfoWindow = (
        <EventInfoWindow
          onOpen={this.windowHasOpened}
          onclose={this.windowHasClosed}
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

  // Handle when an info window is clicked
  infoWindowOnClick(index) {
    let renderedEvent = this.state.renderedEvents[index];
    let event = this.state.allEvents[index];
    let coords = this.getCoords(event.location);
    this.setState({
      lat: coords[0],
      lng: coords[1]
    });
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
      images = imageUrl.map(url =>
	  <Carousel.Item>
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
	    <Card.Text className="event-text"> 
	      <Row>
      	        <Col xs={1}>
		  <PlaceIcon/>
      		</Col>
      		<Col>	
		  {event.locationName}
      		</Col>
      	      </Row>
	    </Card.Text> 
	    <Card.Text> 
	      <Row>
      	        <Col xs={1}>
		  <AccessTimeIcon/>
      		</Col>
      		<Col>	
		  {date}, {startTime} - {endTime}
      		</Col>
      	      </Row>
	    </Card.Text>
	    <Card.Text> 
	      <Row>
      	        <Col xs={1}>
		  <GroupIcon/>
      		</Col>
      		<Col>	
		  {num} attending
      		</Col>
      	      </Row>
	    </Card.Text>
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
    console.log('ready')
    this.setState({
      showInfoWindows: true
    });
  }

  render() {
    return (
      <div>
        <div className="mapView" id="map-view"></div>
      </div>
    )
  }
}


const ConnectMapViewToStore = connect(mapStateToProps);

export default GoogleApiWrapper({
  apiKey: process.env.REACT_APP_API_KEY
})(ConnectMapViewToStore(MapView));
