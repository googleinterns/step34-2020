import React, { Component } from 'react';
import { Form, Button, Jumbotron, Row, Container } from 'react-bootstrap';
import TopNavbar from './Navbar';
import bsCustomFileInput from 'bs-custom-file-input';

class Events extends Component {
  constructor(props) {
    super(props);
    bsCustomFileInput.init();
    this.state = {
      files: null,
    };

    this.onImageInput = this.onImageInput.bind(this);
    
  }

  handleSubmit() {
    this.props.history.push('/map/');
  }

  // When the image is inputted, display the image
  onImageInput(event) {
    var imageArray = [];
    var innerCols = "";

    // Get the images inputted
    const images = event.target.files;
    for (var i = 0; i < images.length; i++) {
      // Change image to url
      var url = URL.createObjectURL(images[i]);
      imageArray.push(url);
      // Construct images and make them into columns
      innerCols += "<Col xs={6} md={4}><Image src=\"" + url + "\" rounded /></Col>";
    }
    this.setState({
      files: imageArray
    });
    // Get the image row element and place it in the inner html
    var imageRow = document.getElementById("imageRow");
    imageRow.innerHTML = innerCols;
  }

  render() {
    
    return(
      <div>
        <TopNavbar />
        <Jumbotron >
          <h1>Create Your Event</h1>
          <Form onSubmit={this.handleSubmit}>
          <Form.Group controlId="formTitle">
            <Form.Label>Event title</Form.Label>
            <Form.Control 
              type="text" 
              cols="1" 
              placeholder="Your title" 
              size="lg" />
            <Form.Text className="text-muted">
              Let's add a title to make your event shine!
            </Form.Text>
            </Form.Group>
            <Form.Group controlId="formDate">
              <Form.Label>Date </Form.Label>
              <Form.Control type="date"/>
              <Form.Text className="text-muted">
                Tell people which day your event is happening on!
              </Form.Text>
            </Form.Group>
            <Form.Group controlId="formTime">
              <Form.Label>Time </Form.Label>
              <Form.Control type="time" />
              <Form.Text className="text-muted">
                Tell people at what time your event is happening!
              </Form.Text>
            </Form.Group>
            <Form.Group controlId="formDescription">
              <Form.Label>Description of your event</Form.Label>
              <Form.Control 
                as="textarea" 
                rows="3" 
                placeholder="Your description" />
              <Form.Text className="text-muted">
                Add a description to let people know what your event is all about!
              </Form.Text>
            </Form.Group>
            <Form.Group controlId="formLocation">
              <Form.Label>Location</Form.Label>
              <Form.Control type="text" placeholder="(12345 Main St)" />
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
                  multiple="true"
                  accept=".jpg, .png"
                  class="custom-file-input" 
                  onChange={this.onImageInput}/>
                <Form.File.Label 
                  data-browse="Browse"
                  for="inputGroup"
                  class="custom-file-label" >
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
              <Form.Control type="text" placeholder="Your organization" />
              <Form.Text className="text-muted">
                Add an organization that's associated with this event!
              </Form.Text>
            </Form.Group>
            <Button variant="primary" type="submit">
              Make your event!
            </Button>
          </Form>
        </Jumbotron>
      </div>
    )
  }
}

export default Events;
