import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Form, Button, Jumbotron, Row, Col, Container, Spinner } from 'react-bootstrap';
import TopNavbar from './Navbar';
import style from 'bootstrap/dist/css/bootstrap.css';
import bsCustomFileInput from 'bs-custom-file-input';
import { fb } from '../App';

const categories = ["Social Gathering", "Volunteer Event", "Student Organization Event"];

class Events extends Component {
  constructor(props) {
    super(props);
    bsCustomFileInput.init();
    this.state = {
      title: "",
      description: "",
      location: "",
      files: [],
      category: 0,
      organization: "",
      date: null,
      startTime: null,
      endTime: null,
      validated: false,
    };

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

  handleLocationChange(input) {
    this.setState({
       location: input.target.value
    });
  }

  // When the image is inputted, display the image
  handleImageInput(event) {
    var imageArray = [];
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
      var location = this.state.location;
      var files = this.state.files;
      var category = categories[this.state.category];
      var organization = this.state.organization;
      var startTime = this.state.startTime;
      var endTime = this.state.endTime;
      var date = this.state.date;
      
      // If there were no images inputted then ignore image upload
      var imageUrls = ""; 
      if (files.length > 0) {
        // Uploads images inputted from the form
        imageUrls = this.changeListToString(await this.uploadImages(files));
      }

      // The respone acquired from the server
      let response = await fb.requestEventCreation(title, date, startTime, endTime, description, location, imageUrls, category, organization);
      if (response) {
	// Go to map page
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
      if (i + 1 == list.length) {
	string += element;
      } else {
        string += element + ",";
      }
    }
    return "[" + string + "]";
  }

  render() { 
    return(
      <div>
        <TopNavbar history={this.props.history} loggedIn={this.props.location.state.loggedIn}/>
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
            <Form.Group>
              <Form.Label>Date</Form.Label>
              <Form.Control
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
                onChange={this.handleDescriptionChange}
      		required
                as="textarea" 
                rows="3" 
                placeholder="Your description" />
              <Form.Text className="text-muted">
                Add a description to let people know what your event is all about!
              </Form.Text>
            </Form.Group>
            <Form.Group>
              <Form.Label>Location</Form.Label>
              <Form.Control 	
                onChange={this.handleLocationChange}
      		required
                type="text"
                placeholder="(12345 Main St)" />
              <Form.Text className="text-muted">
                Tell people where your event is at!
              </Form.Text>
            </Form.Group> 
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
                Add some categories so people can find you event easier! 
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

export default Events;