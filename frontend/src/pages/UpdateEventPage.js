import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Form, Button, Jumbotron, Row, Col, Container, Spinner } from 'react-bootstrap';
import TopNavbar from '../components/Navbar';
import bsCustomFileInput from 'bs-custom-file-input';
import { fb } from '../App';
import Script from 'react-load-script';
import { connect } from "react-redux";
import { changeMapState } from "../actions/index";

function mapDispatchToProps(dispatch) {
  return {
    changeMapState: mapState => dispatch(changeMapState(mapState))
  };
}

const mapStateToProps = state => {
  return { articles: state.articles };
}

const categories = ["Social Gathering", "Volunteer Event", "Student Organization Event"];
const url = "https://maps.googleapis.com/maps/api/js?key=" + process.env.REACT_APP_API_KEY + "&libraries=places";
 
class UpdateEventPage extends Component {
  constructor(props) {
    super(props);

    this.reduxState = this.props.articles[0];

    if (!this.reduxState || !this.reduxState.loggedIn) {
      window.location = "/";
    }

    bsCustomFileInput.init();
    this.state = {
      title: {status: false, value: ""},
      description: {status: false, value: ""},
      location: {status: false, value: ""},
      files: {status: false, value: []},
      category: {status: false, value: 0},
      organization: {status: false, value: ""},
      date: {status: false, value: null},
      startTime: {status: false, value: null},
      endTime: {status: false, value: null},
      validated: {status: false, value: false} ,
      locationName: {status: false, value: ""},
    };

    this.locationAutocomplete = null;
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleTitleChange = this.handleTitleChange.bind(this);
    this.handleDescriptionChange = this.handleDescriptionChange.bind(this);
    this.handleLocationChange = this.handleLocationChange.bind(this);
    this.handleImageInput = this.handleImageInput.bind(this);
    this.handleCategoryChange = this.handleCategoryChange.bind(this);
    this.handleOrganizationChange = this.handleOrganizationChange.bind(this);
    this.handleDateChange = this.handleDateChange.bind(this);
    this.handleStartTimeChange = this.handleStartTimeChange.bind(this);
    this.handleEndTimeChange = this.handleEndTimeChange.bind(this);
    this.handleScriptLoad = this.handleScriptLoad.bind(this);
    this.handleLocationChange = this.handleLocationChange.bind(this);
  }


  handleScriptLoad() {
    /*global google*/
    const fields = ['name', 'address_components', 'formatted_address', 'geometry', 'adr_address', 'plus_code'];

    this.locationAutocomplete = new google.maps.places.Autocomplete(document.getElementById('location-autocomplete'));
    this.locationAutocomplete.setFields(fields);
    this.locationAutocomplete.addListener('place_changed', this.handleLocationChange);
  }

  handleTitleChange(input) {
    this.setState({
       title: {
        status: true,
        value: input.target.value}
    });
  }
  
  handleDateChange(input) {
    this.setState({
      date: {
        status: true,
        value: input.target.value}
    });
  }
  
  handleStartTimeChange(input) {
    this.setState({
      startTim: {
        status: true,
        value: input.target.value}
    });
  }

  handleEndTimeChange(input) {
    this.setState({
      endTime:{
        status: true,
        value: input.target.value}
    });
  }

  handleDescriptionChange(input) {
    this.setState({
      description: {
        status: true,
        value: input.target.value}
    });
  }

  handleLocationChange() {
    const locationAddressObject = this.locationAutocomplete.getPlace();
    const locationObject = locationAddressObject.geometry.location;
    this.setState({
      location: {
        status: true,
        value: locationObject.toString()
      },

        
      locationName: {
        status: true,
        value: locationAddressObject.name
      }
    });
  }
  
  // When the image is inputted, display the image
  handleImageInput(event) {
    var innerCols = "";

    // Get the images inputted
    const images = event.target.files;
    for (var i = 0; i < images.length; i++) {
      // Change image to url
      var url = URL.createObjectURL(images[i]);
      // Construct images and make them into columns
      innerCols += "<Col xs={6} md={4}><Image src=\"" + url + "\" rounded /></Col>";
    }
    this.setState({
      files: {
	status: true,
	value: images
      }
    });
    // Get the image row element and place it in the inner html
    var imageRow = document.getElementById("imageRow");
    imageRow.innerHTML = innerCols;
  }
 
  handleCategoryChange(input) {
    this.setState({
      category: {
        status: true,
        value: input.target.value
      }
    });
  }

  handleOrganizationChange(input) {
    this.setState({
       organization: {
        status: true,
        value: input.target.value}
    });
  }
  
  async handleSubmit(event) {
    // Get current target and prevent the default action when submitting
    const form = event.currentTarget;
    event.preventDefault();
    // Style each element was validated
    event.target.className += " was-validated"; 
    
    // Check validity of each input field and make sure everything has been filled
    if (!form.checkValidity()) {
      // If some fields are left out, put a warning message next to the submit button
      event.stopPropagation();
      ReactDOM.render("Please fill in all required fields.", document.getElementById("warning"));
    } else {  
      // Else, make the warning message empty and add a spinner on the side to show it processing
      ReactDOM.render("", document.getElementById("warning"));
      ReactDOM.render(<Spinner animation="border" variant="secondary"/>, document.getElementById("spinner-area"));
      var title = null;
      var description = null;
      var location = null;
      var files = [];
      var category = null;
      var organization = null;
      var startTime = null;
      var endTime = null;
      var date = null;
      var locationName = null;

      if (this.state.title.status) {
        title = this.state.title.value;
      }

      if (this.state.description.status) {
        description = this.state.description.value;
      }

      if (this.state.location.status) {
        location = this.state.location.value;
      }
      if (this.state.files.status) {
        files = this.state.files.value;
      }

      if (this.state.category.status) {
        category = categories[this.state.category.value];
      }
      
      if (this.state.organization.status) {
        organization = this.state.organization.value;
      }

      if (this.state.startTime.status) {
        startTime = this.state.startTime.value;
      }
      
      if (this.state.endTime.status) {
        endTime = this.state.endTime.value;
      }

      if (this.state.date.status) {
        date = this.state.date.value;
      }
      
      if (this.state.locationName.status) {
        locationName = this.state.locationName.value;
      }
     
      // If there were no images inputted then ignore image upload
      var imageUrls = null; 
      if (files.length > 0) {
        // Uploads images inputted from the form
        imageUrls = this.changeListToString(await this.uploadImages(files));
      }

      var uid = this.reduxState.credentials.uid;
      var eventId = this.reduxState.reference;
      // The respone acquired from the server
      let response = await fb.requestEventUpdate(eventId, uid, title, date, startTime, endTime, description, location, locationName, imageUrls, category, organization);
      if (response) {
        this.props.history.push({
          pathname: '/map/',
        })
      } 
    }
  }
  
  // Uploads images from a FileList and returns the paths of each image.
  async uploadImages(files) {
    var parentPath = "images/events/" + fb.sessionId;
    let urls = await fb.uploadImagesToPath(files, parentPath);
    if (urls == null) {
      return;
    } else {
      return urls;
    }
  }

  // Changes the list into string form. (Ex. ["item1", "item2"])
  changeListToString(list) {
    var string = "";
    for (var i = 0; i < list.length; i++) {
      var element = list[i];
      if (i + 1 === list.length) {
        string += element;
      } else {
        string += element + ",";
      }
    }
    return "[" + string + "]";
  }
  
  render() {
    return (
      <div>
        <Script url={url} onLoad = {this.handleScriptLoad}/>
        <TopNavbar history={this.props.history}/>
        <Jumbotron >
          <h1>Edit Your Event</h1>
          <Form noValidate validated={this.validated} onSubmit={this.handleSubmit}>
            <Form.Group>
              <Form.Label>Event title</Form.Label>
              <Form.Control
                defaultValue={this.reduxState.eventObject.eventName}
                required
                onChange={this.handleTitleChange}
                type="text" 
                cols="1" 
                placeholder="Your title" 
                size="lg" />
              <Form.Text className="text-muted">
                  Let's add a title to make your event shine!
              </Form.Text>
            </Form.Group>
            <Form.Group>
              <Form.Label>Date</Form.Label>
              <Form.Control
                defaultValue={this.reduxState.eventObject.date}
                required
                onChange={this.handleDateChange}
                type="date"/>
              <Form.Text className="text-muted">
                Tell people which your event is on!
              </Form.Text>
            </Form.Group>
            <Form.Group>
              <Form.Label>Start Time</Form.Label>
              <Form.Control 
                defaultValue={this.reduxState.eventObject.startTime}	
                onChange={this.handleStartTimeChange}
                required
                type="time"/>
              <Form.Text className="text-muted">
                Tell people when your event starts!
              </Form.Text>
            </Form.Group>
            <Form.Group>
              <Form.Label>End Time</Form.Label>
              <Form.Control
                defaultValue={this.reduxState.eventObject.endTime} 
                onChange={this.handleEndTimeChange}
                required
                type="time"/>
              <Form.Text className="text-muted">
                Tell people when your event ends!
              </Form.Text>
            </Form.Group>
            <Form.Group>
              <Form.Label>Description of your event</Form.Label>
              <Form.Control
                defaultValue={this.reduxState.eventObject.description}
                onChange={this.handleDescriptionChange}
                required
                as="textarea" 
                rows="3" 
                placeholder="Your description" />
              <Form.Text className="text-muted">
                Add a description to let people know what your event is all about!
              </Form.Text>
            </Form.Group>
            <Form.Row>
              <Form.Group as={Col}>
                <Form.Label>Location</Form.Label>
                <Form.Control
                  defaultValue={this.reduxState.eventObject.locationName} 
                  id="location-autocomplete"	
                  required
                  type="text"
                  placeholder="12345 Main St" />
                <Form.Text className="text-muted">
                  Tell people where your event is at!
                </Form.Text>
              </Form.Group> 
            </Form.Row>
            <Form.Group>
              <Form.Label>Categories</Form.Label>
              <Form.Control
                onChange={this.handleCategoryChange}
                as="select"
                className="my-1 mr-sm-2"
                id="categoriesSelect"
                required
                custom="true">
                <option value="">Choose...</option>
                <option value="0">Social Gathering</option>
                <option value="1">Volunteer Event</option>
                <option value="2">Student Organization Event</option>
              </Form.Control>
              <Form.Text className="text-muted">
                Add some categories so people can find your event easier! 
              </Form.Text>
            </Form.Group>
            <Form.Group>
              <Form.Label>Images</Form.Label>
              <Form.File 
                id="eventImages" 
                custom="true" >
              <Form.File.Input
                id="inputGroup"
                type="image" 
                multiple
                accept=".jpg, .png"
                className="custom-file-input" 
                onChange={this.handleImageInput}/>
              <Form.File.Label 
                data-browse="Browse"
                htmlFor="inputGroup"
                className="custom-file-label" >
                Click me to browse for images!
              </Form.File.Label>
              </Form.File>
              <Form.Text className="text-muted">
                Add some pictures to show what your event is all about!
              </Form.Text>
            </Form.Group>
            <Container>
              <Row id="imageRow">
              </Row>
            </Container>
            <Form.Group>
              <Form.Label>Organization</Form.Label>
              <Form.Control
                defaultValue={this.reduxState.eventObject.organization} 
                onChange={this.handleOrganizationChange}
                type="text" 
                placeholder="Your organization" />
              <Form.Text className="text-muted">
                Add an organization that's associated with this event!
              </Form.Text>
            </Form.Group>
            <Row>
              <Col md="auto">
              <Button 
                id="eventSubmit"
                variant="primary" 
                type="submit">
                Save Changes
              </Button>
              </Col>
              <Col md="auto" id="spinner-area">
              </Col>
            </Row>
            <div id="warning" className="text-danger"></div>
          </Form>
        </Jumbotron>
      </div>
    )
  }
}

const ConnectedUpdateEvent = connect(
  mapStateToProps,
  mapDispatchToProps
)(UpdateEventPage);

export default ConnectedUpdateEvent;
