import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Card } from 'react-bootstrap';
import { Map, GoogleApiWrapper, } from 'google-maps-react';
import { fb } from '../App';
import { connect } from "react-redux";
import { Deferred } from '@firebase/util';
import { Provider } from "react-redux";
import EventInfoWindow from "./EventInfoWindow";
import EventInfoWindowCard from "./EventInfoWindowCard";
import EventSidePanel from "./EventSidePanel";
import moment from 'moment';
import '../gm-styles.css';
import '../App.css';
import store from "../store/index";

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
      filter_choice: this.reduxState.filter_choice,
      isChecked: false
    };

    this.renderInfo = this.renderInfo.bind(this);
  }

  async componentDidMount() {
    await this.setState({
      allEvents: [] 
    });
    await this.queryEventsAndStoreInMemory(this.state.plusCode);
    await this.initializeRender();
  }

  // Called whenever the props change (when the university, filter, or time today are changed)
  async UNSAFE_componentWillReceiveProps(nextProps) {
    // If the plus code changes, requery with the new plus code and wipe all event data currently on the map
    const newPlusCode = nextProps.plusCode;
    if (newPlusCode !== this.state.plusCode) {
      await this.setState({ 
        allEvents: [], 
        plusCode: newPlusCode 
      });
      await this.queryEventsAndStoreInMemory(newPlusCode);
      await this.initializeRender();
    }

    this.showAllEvents();
    
    // If the filter has changed, set the state and handle filter changes
    const newFilter = nextProps.articles[0].filter_choice;
    if (newFilter !== this.state.filter_choice) {
      await this.setState({ 
        filter_choice: newFilter
      });
      this.handleFilterChange();
    }

    // If the today's events is checked, set the state and handle filter changes
    const newCheckboxValue = nextProps.articles[0].isChecked;
    if (newCheckboxValue) {
      await this.setState({
        isChecked: newCheckboxValue
      });
      this.handleTimeTodayChange();
    }
  }

  // Initializes the render for whenever the map get loaded first or whenever the plus code props change
  async initializeRender() {  
    await this.setState({
      renderedEvents: []
    });
    this.renderInfo();

    await this.setState({
      renderedEvents: []
    });
    this.renderInfo();
  }

  showAllEvents() {
    this.state.renderedEvents.forEach(element => element.eventRef.current.show());
  }

  // Checks if we need to show only today, if we do, hide all events that are not today
  handleTimeTodayChange() {
    if (this.state.isChecked) {
      const today = new Date();
      const todayInfo = {
        year: today.getFullYear(),
        month: today.getMonth() + 1,
        day: today.getDate()
      }
      
      this.state.allEvents.forEach((event, index) => {
        // event.date is YYYY-MM-DD
        //               0123456789
        const eventDate = event.date;
        const eventInfo = {
          year: parseInt(eventDate.substring(0, 4)),
          month: parseInt(eventDate.substring(5, 7)),
          day: parseInt(eventDate.substring(8, 10)),
        };

        const matches = {
          yearsMatch: todayInfo.year === eventInfo.year,
          monthsMatch: todayInfo.month === eventInfo.month,
          daysMatch: todayInfo.day === eventInfo.day
        }

        const datesMatch = matches.yearsMatch && matches.monthsMatch && matches.daysMatch;

        if (!datesMatch) {
          this.state.renderedEvents[index].eventRef.current.hide();
        }
      });
    }
  }

  // Handles when the filter changes. Hides all event infowindows that are not part of that category
  handleFilterChange() {
    const filter_choice =  this.state.filter_choice;
    if (filter_choice !== null && typeof filter_choice !== 'undefined') {
      this.state.allEvents.forEach((element, index) => {
        if (element.category.toLowerCase() !== (filter_choice).toLowerCase()) {
          this.state.renderedEvents[index].eventRef.current.hide();
        }
      });
    }
  }

  // Renders the map with the event info
  renderInfo () { 
    let container = document.getElementById('map-view');
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
    const eventsRef = fb.eventsRef;
    eventsRef.child("university")
    .child(plusCode).child("All")
    .orderByKey()
    .on("value", async (dataSnapshot) => {
      if (dataSnapshot.numChildren() !== 0) {
        var events = Object.values(dataSnapshot.val());
        for (var i = 0; i < events.length; i++) {
          await this.updateEventIdsAndLoadEvent(events[i]);
        }
        deferred.resolve();
      }
    });
    return deferred.promise;
  }

  // Updates the allEvents map with the given eventId. Listens for changes from the eventId.
  async updateEventIdsAndLoadEvent(eventId) {
    var deferred = new Deferred();
    const eventsRef = fb.eventsRef;

    // Query and then listen for any changes of that event
    eventsRef.child("events").child(eventId).on("value", (dataSnapshot) => {
      const eventObj = dataSnapshot.val();

      // If the state has the event then update the change
      if (this.state.allEvents[eventId] !== undefined) {
        this.updateEvent(eventId, eventObj);
      } else {
        // If the state doesnt have the event, add the event to the map
        this.setState(prevState => ({
          allEvents: [...prevState.allEvents, eventObj]
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
      const eventInfoWindowCardProps = {
        eventName: event.eventName,
        locationName: event.locationName,
        date: date,
        startTime: startTime,
        endTime: endTime,
        category: event.category 
      }

      var eventInfoWindow = (
        <EventInfoWindow
          key={index}
          index={index}
          ref={eventRef}
          visible={this.state.showInfoWindows}
          position={{
            lat: lat,
            lng: lng
          }}>
          <Card
            border="light"
            tag="a"
            onClick={this.infoWindowOnClick.bind(this, index)}
            style={{cursor: 'pointer'}}>
            <EventInfoWindowCard eventInfo={eventInfoWindowCardProps}/>
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
      coords = location.slice(1, length - 2);
      coords = coords.split(",");
    }
    return coords;
  }

  // Handle when an info window is clicked
  infoWindowOnClick(index) {
    let event = this.state.allEvents[index];
    let coords = this.getCoords(event.location);

    var lat = parseFloat(coords[0]);
    var lng = parseFloat(coords[1]);
    let googleMapCoords = new this.mapRef.props.google.maps.LatLng(lat, lng);
    this.mapRef.map.panTo(googleMapCoords);

    this.renderSidePanel(event);
  }

  renderSidePanel(event) {
    var eventInfo = (
      <Provider store={store}>
        <EventSidePanel event={event}/>
      </Provider>
    );

    let eventInfoContainer = document.getElementById("event-info");
    ReactDOM.render(eventInfo, eventInfoContainer);
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
