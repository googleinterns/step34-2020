import React, { Component } from 'react';
import Script from 'react-load-script';
import { Collapse, Container, Col, Form, Button, Jumbotron } from 'react-bootstrap';
import { changeMapState } from "../actions/index";
import { connect } from "react-redux";
import TopNavbar from './Navbar';
import Searchbar from './Searchbar';
import 'animate.css';
import '../App.css';

const url = "https://maps.googleapis.com/maps/api/js?key=" + process.env.REACT_APP_API_KEY + "&libraries=places";

function mapDispatchToProps(dispatch) {
  return {
    changeMapState: mapState => dispatch(changeMapState(mapState))
  };
}

const mapStateToProps = state => {
  return { articles : state.articles }
}

/* global google */

class Search extends Component {
  constructor(props) {
    super(props);

    this.handleScriptLoad = this.handleScriptLoad.bind(this);
    this.rerenderParentCallback = this.rerenderParentCallback.bind(this);
    this.handleButtonClick = this.handleButtonClick.bind(this);
    this.onFindClick = this.onFindClick.bind(this);
    this.onCreateClick = this.onCreateClick.bind(this);
    this.onShareClick = this.onShareClick.bind(this);
    this.types = ['university'];
    this.autocomplete = null;

    this.state = {
      location: null,
      viewport: null,
      loggedIn: false,
      openFind: true,
      openCreate: false,
      openShare: false,
      plusCode: '847X884Q+22',
      background: "",
      playBottomAnim: "",
    };
  }

  // Handles scrolling navigation so to handle background color changes
  handleNavigation = (e) => {
    const window = e.currentTarget;

    // condition for if on the last section
    let greaterThanNext = window.scrollY > document.body.scrollHeight - document.body.scrollHeight/2;
    // condition for if on the second section
    let lessThanNext = window.scrollY < document.body.scrollHeight - document.body.scrollHeight/2;
    // condition for if on the first section
    let greaterThanPrevious = window.scrollY > document.body.scrollHeight/4;

    // Check scrolling direction
    // This is going upwars
    if (this.prev > window.scrollY) {
      if (window.scrollY < document.body.scrollHeight/4) {
        // Set the state to do an animation from dark to light
        this.setState({background: "backgroundToLight"})
      } else if (lessThanNext && greaterThanPrevious) {
        // Set the state to do an animation from dark to dark
        this.setState({background: "backgroundToDark"})
      }
    } else if (this.prev < window.scrollY) {
      // Going downwards
      if (lessThanNext && greaterThanPrevious) {
        this.setState({background: "backgroundToDark"})
      } else if (greaterThanNext) {
        this.setState({background: "backgroundToLight"})
      }
    }
    this.prev = window.scrollY;
  };

  componentDidMount() {
    this.prev = window.scrollY;
    window.addEventListener('scroll', e => this.handleNavigation(e));
  }

  onFindClick() {
    this.setState({
      openFind: true,
      openCreate: false,
      openShare: false
    });
  }

  onCreateClick() {
    this.setState({
      openFind: false,
      openCreate: true,
      openShare: false
    });
  }

  onShareClick() {
    this.setState({
      openFind: false,
      openCreate: false,
      openShare: true
    });
  }

  renderCollapses() {
    return(
      <div style={{width: "50%", textAlign: "left"}}>
        <h1 className="collapseTitle" onClick={this.onFindClick}>Find</h1>
        <Collapse in={this.state.openFind}>
          <div className="collapseText">
            <br/>
            Find an event on your map by first selecting <br/>your university.
            <br/>
            <br/>
          </div>
        </Collapse>
        <hr className="collapseLine"/>
        <h1 className="collapseTitle" onClick={this.onCreateClick}>Create</h1>
        <Collapse in={this.state.openCreate}>
          <div className="collapseText">
            <br/>
            Create an event by first clicking on "Create Event". Then, input your event details and click "Make Your Event!". Your event will then be displayed on the map!
            <br/>
            <br/>
          </div>
        </Collapse>
        <hr className="collapseLine"/>
        <h1 className="collapseTitle" onClick={this.onShareClick}>Share</h1>
        <Collapse in={this.state.openShare}>
          <div className="collapseText">
            <br/>
            Finally, share your event with your friends! Go to your profile page, and click the share icon to send your public event to your friends!
            <br/>
            <br/>
          </div>
        </Collapse>
        <hr className="collapseLine"/>
      </div>
    );
  }

  renderMore() {
    return(
      <div style={{textAlign: "center"}}>
        <h1 style={{fontWeight: "400", fontFamily: "Roboto"}}>And more...</h1>
        <br/>
        <br/>
        <h1 style={{fontWeight: "400", fontFamily: "Roboto"}}>Let's get started</h1>
        <br/>
        <br/>
        <Form>
          <Form.Group>
            <div className="inputUni animate__animated animate__fadeIn">
              <Form.Control
                size="lg"
                id="autocompleteMore"
                placeholder="Enter university"/>
            </div>
          </Form.Group>
          <br/>
          <Button
            variant="primary"
            type="submit"
            className="findeventbutton animate__animated animate__fadeIn"
            onClick={this.handleButtonClick}>
              Launch MapIT
          </Button>
        </Form>
      </div>
    );
  }

  render() {
    return (
      <div className={this.state.background}>
        <Script
          url = {url}
          onLoad = {this.handleScriptLoad}/>
        <TopNavbar
          loggedIn={this.state.loggedIn}
          history={this.props.history}/>
        <Jumbotron>
          <Container style={{textAlign: "center", height: "100vh"}}>
            <h1 className="title animate__animated animate__fadeInDown">
              <span style={{color: "#4486F4"}}>M</span>
              <span style={{color: "#0096EF"}}>a</span>
              <span style={{color: "#00BDD3"}}>p</span>
              <span style={{color: "#04D064"}}>I</span>
              <span style={{color: "#1CA45C"}}>T</span>
            </h1>
            <br/>
            <Form>
              <Form.Group>
                <Form.Label className="subtitle">Find an event with a click of <br /> a button.</Form.Label>
                <br/>
                <Form.Label className="subtitle1">
                  <span className="find animate__animated animate__fadeIn" style={{color: "#0096EF"}}>Find. </span>
                  <span className="create animate__animated animate__fadeIn" style={{color: "#EA4335"}}>Create. </span>
                  <span className="share animate__animated animate__fadeIn" style={{color: "#1CA45C"}}>Share.</span>
                </Form.Label>
                <br/>
                <br/>
                <br/>
                <div className="inputUni animate__animated animate__fadeIn">
                  <Searchbar 
                    size="lg"
                    rerenderParentCallback={this.rerenderParentCallback}/>
                </div>
              </Form.Group>
              <br/>
              <Button
                variant="primary"
                type="submit"
                className="findeventbutton animate__animated animate__fadeIn "
                onClick={this.handleButtonClick}>
                Launch MapIT
              </Button>
            </Form>
          </Container>
          <Container style={{width: "75vw", height: "80vh"}}>
            <Col>
              <h1 className="exploreTitle">Explore MapIT</h1>
              <br/>
              {this.renderCollapses()}
            </Col>
            <Col>
            </Col>
          </Container>
          <Container style={{width: "75vw", height: "80vh"}}>
            {this.renderMore()}
          </Container>
        </Jumbotron>
      </div>
    );
  }

  async handleScriptLoad() {
    /*global google*/
    var defaultLatLng = new google.maps.LatLng({
      lat: 35.3050053,
      lng: -120.6624942
    });


    var updatedState = {
      lat: defaultLatLng.lat(),
      lng: defaultLatLng.lng(),
      loggedIn: false,
      credentials: null,
      filter_choice: "",
      isChecked: false
    };
    await this.props.changeMapState(updatedState);
    await this.setState({
      lat: defaultLatLng.lat(),
      lng: defaultLatLng.lng(),
      loggedIn: false,
      credentials: null,
      filter_choice: "",
      isChecked: false
    });
  }
  
  rerenderParentCallback() {
    var updatedState = this.props.articles[0];
    this.setState(updatedState);
  }

  handleButtonClick(event) {
    var mutedText = document.getElementById('text-muted');
    if (this.state.location == null) {
      mutedText.innerHTML = 'Please select your university from the drop-down menu.';
      event.preventDefault();
    } else if (this.state.plusCode == null) {
      mutedText.innerHTML = 'MapIT does not support this location.  Please choose another.';
      event.preventDefault();
    } else {
      event.preventDefault();
      this.props.history.push({
        pathname: '/map',
      });
    }
  }
}

const ConnectedSearch = connect(
  mapStateToProps,
  mapDispatchToProps
)(Search);

export default ConnectedSearch;
