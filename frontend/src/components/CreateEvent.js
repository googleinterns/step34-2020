import React, { Component } from 'react';
import { Form, Button, Jumbotron, Row, Container } from 'react-bootstrap';
import TopNavbar from './Navbar';
import bsCustomFileInput from 'bs-custom-file-input';
import { fb } from '../App';

const categories = ["None","Social Gathering", "Volunteer Event", "Student Organization Event"];

class Events extends Component {
  constructor(props) {
    super(props);
    bsCustomFileInput.init();
    this.state = {
      title: "",
      description: "",
      location: "",
      files: null,
      category: 0,
      organization: "",
      date: null,
      startTime: null,
      endTime: null,
       
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
    event.preventDefault();
    var title = this.state.title;
    var description = this.state.description;
    var location = this.state.location;
    var files = this.state.files;
    var category = categories[this.state.category];
    var organization = this.state.organization;
    var startTime = this.state.startTime;
    var endTime = this.state.endTime;
    var date = this.state.date;
    var imagePaths = this.changeListToString(await this.uploadImages(files));

    //var imageUrls = ["url1, url2"];
    let response = await fb.requestEventCreation(title, date, startTime, endTime, description, location, imagePaths, category, organization);
    if (response) {
      // Go to map page
    } 
  }

  async uploadImages(files) {
    var parentPath = "images/events/" + fb.sessionId;
    let paths = await fb.uploadImagesToPath(files, parentPath);
    if (paths == null) {
      return;
    } else {
      return paths;
    }
  }

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
    
    return(
      <div>
        <TopNavbar loggedIn={true} credentials={this.props.credentials} />
        <Jumbotron >
          <h1>Create Your Event</h1>
          <Form onSubmit={this.handleSubmit}>
            <Form.Group controlId="formTitle">
              <Form.Label>Event title</Form.Label>
              <Form.Control
                onChange={this.handleTitleChange}
                type="text" 
                cols="1" 
                placeholder="Your title" 
                size="lg" />
              <Form.Text className="text-muted">
                  Let's add a title to make your event shine!
              </Form.Text>
            </Form.Group>
            <Form.Group controlId="formDate">
              <Form.Label>Date</Form.Label>
              <Form.Control 	
                onChange={this.handleDateChange}
                type="date"/>
              <Form.Text className="text-muted">
                Tell people which your event is on!
              </Form.Text>
            </Form.Group>
            <Form.Group controlId="formStartTime">
              <Form.Label>Start Time</Form.Label>
              <Form.Control 	
                onChange={this.handleStartTimeChange}
                type="time"/>
              <Form.Text className="text-muted">
                Tell people when your event starts!
              </Form.Text>
            </Form.Group>
            <Form.Group controlId="formEndTime">
              <Form.Label>End Time</Form.Label>
              <Form.Control 
                onChange={this.handleEndTimeChange}
                type="time"/>
              <Form.Text className="text-muted">
                Tell people when your event ends!
              </Form.Text>
            </Form.Group>
            <Form.Group controlId="formDescription">
              <Form.Label>Description of your event</Form.Label>
              <Form.Control
                onChange={this.handleDescriptionChange}
                as="textarea" 
                rows="3" 
                placeholder="Your description" />
              <Form.Text className="text-muted">
                Add a description to let people know what your event is all about!
              </Form.Text>
            </Form.Group>
            <Form.Group controlId="formLocation">
              <Form.Label>Location</Form.Label>
              <Form.Control 	
                onChange={this.handleLocationChange}
                type="text"
                placeholder="(12345 Main St)" />
              <Form.Text className="text-muted">
                Tell people where your event is at!
              </Form.Text>
            </Form.Group>
            <Form.Group controlId="formImages">
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
                  
            <Form.Group controlId="formCategories">
              <Form.Label>Categories</Form.Label>
              <Form.Control	
                onChange={this.handleCategoryChange}
                as="select"
                className="my-1 mr-sm-2"
                id="categoriesSelect"
                custom="true">
                <option value="0">Choose...</option>
                <option value="1">Social Gathering</option>
                <option value="2">Volunteer Event</option>
                <option value="3">Student Organization Event</option>
              </Form.Control>
              <Form.Text className="text-muted">
                Add some categories so people can find you event easier! 
              </Form.Text>
            </Form.Group>
            <Form.Group controlId="formOrganization">
              <Form.Label>Organization</Form.Label>
              <Form.Control 
                onChange={this.handleOrganizationChange}
                type="text" 
                placeholder="Your organization" />
              <Form.Text className="text-muted">
                Add an organization that's associated with this event!
              </Form.Text>
            </Form.Group>
            <Button 
              id="eventSubmit"
              variant="primary" 
              type="submit">
              Make your event!
            </Button>
          </Form>
        </Jumbotron>
      </div>
    )
  }
}

export default Events;
