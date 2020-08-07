import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Form, Button, Jumbotron, Row, Col, Container, Spinner } from 'react-bootstrap';
import TopNavbar from '../components/Navbar';
import bsCustomFileInput from 'bs-custom-file-input';
import { fb } from '../App';
import Script from 'react-load-script';
import { connect } from "react-redux";
import { changeMapState } from "../actions/index";
import PopUp from '../components/PopUp';

const FIELDS = ['name', 'address_components', 'formatted_address', 'geometry', 'adr_address', 'plus_code'];
const ERROR_MESSAGE = "MapIT does not support this location.  Please choose another.";

const mapStateToProps = state => {
  return { articles: state.articles };
};

function mapDispatchToProps(dispatch) {
  return {
    changeMapState: mapState => dispatch(changeMapState(mapState))
  };
}

const categories = ["Social Gathering", "Volunteer Event", "Student Organization Event"];
const url = "https://maps.googleapis.com/maps/api/js?key=" + process.env.REACT_APP_API_KEY + "&libraries=places";

class CreateEventPage extends Component {
  constructor(props) {
    super(props);

    this.reduxState = this.props.articles[0];

    if (!this.reduxState || !this.reduxState.loggedIn) {
      window.location = "/";
    }

    bsCustomFileInput.init();
    this.state = {
      title: "",
      description: "",
      plusCode: "",
      location: "",
      files: [],
      category: 0,
      organization: "",
      date: null,
      startTime: null,
      endTime: null,
      validated: false,
      locationName: "",
    };

    this.reduxState = this.props.articles[0];

    this.unviersityAutocomplete = null;
    this.locationAutocomplete = null;
    this.hasLocationError = false;

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
    this.handlePlusCodeChange = this.handlePlusCodeChange.bind(this);
    this.handleLocationChange = this.handleLocationChange.bind(this);
  }

  handleScriptLoad() {
    /*global google*/
    this.universityAutocomplete = new google.maps.places.Autocomplete(document.getElementById('university-autocomplete'));
    this.universityAutocomplete.setFields(FIELDS);
    this.universityAutocomplete.addListener('place_changed', this.handlePlusCodeChange);

    this.locationAutocomplete = new google.maps.places.Autocomplete(document.getElementById('location-autocomplete'));
    this.locationAutocomplete.setFields(FIELDS);
    this.locationAutocomplete.addListener('place_changed', this.handleLocationChange);
  }

  handleTitleChange(input) {
    this.setState({
       title: input.target.value
    });
  }

  handleDateChange(input) {
    this.setState({
      date: input.target.value
    });
  }

  handleStartTimeChange(input) {
    this.setState({
      startTime: input.target.value
    });
  }

  handleEndTimeChange(input) {
    this.setState({
      endTime: input.target.value
    });
  }

  handleDescriptionChange(input) {
    this.setState({
       description: input.target.value
    });
  }

  handlePopUp(message) {
    ReactDOM.render(
      <div>
        <PopUp 
          show={true}
          onHide={this.hidePopUp.bind(this)}
          message={message} />
      </div>,
      document.getElementById('popup-wrapper'))
  }

  hidePopUp() {
    const modal = document.getElementById('popup-wrapper');
    ReactDOM.unmountComponentAtNode(modal);
  }

  handlePlusCodeChange() {
    const universityAddressObject = this.universityAutocomplete.getPlace();

    if (typeof universityAddressObject.plus_code != 'undefined') {
      const universityPlusCode = universityAddressObject.plus_code.global_code;
      this.hasLocationError = false;
      this.setState({
        plusCode: universityPlusCode
      });
    } else {
      this.hasLocationError = true;
      this.handlePopUp(ERROR_MESSAGE);
    }

  }

  handleLocationChange() {
    const locationAddressObject = this.locationAutocomplete.getPlace();
    const locationObject = locationAddressObject.geometry.location;
    this.setState({
       location: locationObject.toString(),
       locationName: locationAddressObject.name + ", " + locationAddressObject.formatted_address
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
      files: images
    });
    // Get the image row element and place it in the inner html
    var imageRow = document.getElementById("imageRow");
    imageRow.innerHTML = innerCols;
  }

  handleCategoryChange(input) {
    this.setState({
       category: input.target.value
    });
  }

  handleOrganizationChange(input) {
    this.setState({
       organization: input.target.value
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
      var title = this.state.title;
      var description = this.state.description;
      var plusCode = this.state.plusCode;
      var location = this.state.location;
      var files = this.state.files;
      var category = categories[this.state.category];
      var organization = this.state.organization;
      var startTime = this.state.startTime;
      var endTime = this.state.endTime;
      var date = this.state.date;
      var locationName = this.state.locationName;

      // If there were no images inputted then ignore image upload
      var imageUrls = "";
      if (files.length > 0) {
        // Uploads images inputted from the form
        imageUrls = this.changeListToString(await this.uploadImages(files));
      }

      // Assign creator as attendee
      var attendees = []
      attendees.push(this.reduxState.credentials.uid)

      // The respone acquired from the server
      let response = await fb.requestEventCreation(title, date, startTime, endTime, description, plusCode, location, locationName, imageUrls, category, organization,  this.changeListToString(attendees), this.reduxState.credentials.uid);
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
          <h1>Create Your Event</h1>
          <Form noValidate validated={this.validated} onSubmit={this.handleSubmit}>
            <Form.Group>
              <Form.Label>Event title</Form.Label>
              <Form.Control
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
            <Form.Row>
              <Form.Group xs="auto">
                <Form.Label>Date</Form.Label>
                <Form.Control
                  required
                  onChange={this.handleDateChange}
                  type="date"/>
                <Form.Text className="text-muted">
                  Tell people which day your event is on!
                </Form.Text>
              </Form.Group>
            </Form.Row>
            <Form.Row>
              <Form.Group as={Col} xs="auto">
                <Form.Label>Start Time</Form.Label>
                <Form.Control
                  onChange={this.handleStartTimeChange}
                  required
                  type="time"/>
                <Form.Text className="text-muted">
                  Tell people when your event starts!
                </Form.Text>
              </Form.Group>
              <Form.Group as={Col} xs="auto">
                <Form.Label>End Time</Form.Label>
                <Form.Control
                  onChange={this.handleEndTimeChange}
                  required
                  type="time"/>
                <Form.Text className="text-muted">
                  Tell people when your event ends!
                </Form.Text>
              </Form.Group>
            </Form.Row>
            <Form.Group>
              <Form.Label>Description of your event</Form.Label>
              <Form.Control
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
              <Form.Group xs="auto" as={Col}>
                <Form.Label>University</Form.Label>
                <Form.Control
                  id="university-autocomplete"
                  required
                  type="text"
                  placeholder="Stanford University" />
                <Form.Text className="text-muted-university">
                  Tell people what university your event is at!
                </Form.Text>
              </Form.Group>
              <Form.Group as={Col} xs="auto">
              <Form.Label>Location</Form.Label>
              <Form.Control
                    id="location-autocomplete"
                required
                type="text"
                placeholder="12345 Main St" />
              <Form.Text className="text-muted-location">
                Tell people where your event is at!
              </Form.Text>
              </Form.Group>
            </Form.Row>
            <Form.Row>
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
            </Form.Row>
            <Form.Row>
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
            </Form.Row>
            <Container>
              <Row id="imageRow">
              </Row>
            </Container>
            <Form.Group>
              <Form.Label>Organization</Form.Label>
              <Form.Control
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
                Make your event!
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

const ConnectedEventPage = connect(
  mapStateToProps,
  mapDispatchToProps
)(CreateEventPage);

export default ConnectedEventPage;
