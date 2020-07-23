import React from 'react';
import ReactDOM from 'react-dom';
import TopNavbar from './Navbar';
import '../App.css';
import { CardDeck, Image, Container, Jumbotron, Nav, Tab, Row, Col } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import ButtonToolBar from 'react-bootstrap/ButtonToolbar';
import { fb } from '../App';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';
import Card from 'react-bootstrap/Card';
import CardColumns from 'react-bootstrap/CardColumns';
import ConfirmDelete from './ConfirmDelete';

class Profile extends React.Component {
  constructor(props) {
    super(props);

    const JSONString = props.history.location.state.credentials;
    const JSONObject = JSON.parse(JSONString);

    this.state = {
      profilePicture: "https://moonvillageassociation.org/wp-content/uploads/2018/06/default-profile-picture1.jpg",
      credentials: JSONObject,
      cards:[],
      showConfirmModal: false,
      contents: null,
    };

    this.showModal =  this.showModal.bind(this);
    this.hideModal = this.hideModal.bind(this);
    this.handleEdit = this.handleEdit.bind(this);
    
  }

  didUpdate(event, parent, ref) {
    if(event !== null) {
      var attendees = ["user1", "user2", "user3"];
    var len = 0;
    var imageUrl = "";
    var card = "";

    // Since images are option field, evaluate whether the field isn't null
    if (event.imagePaths != null) {
      len = event.imagePaths.length;
    }
    // Retrieve image urls only if they were provided. Otherwise set url to default value
    if(len > 0) {
      imageUrl = event.imagePaths.slice(1, len - 2);
      imageUrl = imageUrl.split(",");

      // dynamically create a card that contain images for the event
      card = imageUrl.map(url => <Image fluid src={url} />);
    }

    // Add this card to the list of all cards to be displayed on the profile
    this.state.cards.push(
      <Card
      	className="shadow p-3 mb-5 bg-white rounded event-cards"
        key={Math.random(1001,5000)} 
        text={'light' ? 'dark' : 'white'}>
        {/* <Card.Img variant="top" src={imageUrl[0]} /> */}
        <Card.Body>
          <Card.Title>{event.eventName}</Card.Title>
          <Card.Text>
            {event.description}
          </Card.Text>
          <Card.Text>{event.locationName}</Card.Text>
          <Card.Text>{event.startTime} - {event.endTime}</Card.Text>
      	  <Col className="col align-self-center">
            {card}
      	  </Col>
          <DropdownButton id="dropdown-basic-button" title="Attendees">
            {attendees.map(attendee => (
              <Dropdown.Item key={Math.random(1000)} >{attendee}</Dropdown.Item>))}
          </DropdownButton><br />
          <ButtonToolBar>
            <Button 
            variant="success"
            style={{ marginRight:".8rem", width:"80px" }}
            onClick={() => this.handleEdit(ref, event)}>
              Edit
            </Button>
            <Button 
              variant="danger" 
              style={{ width:"80px" }}
              onClick={() => this.showModal(ref)}>
              Delete
            </Button>
          </ButtonToolBar>
        </Card.Body>
      </Card>)


      this.setState({
        contents: <CardDeck>
                    {this.state.cards.map(element   => element)}
                  </CardDeck>
      })
    }
    
  }

  getData(eventKeys){

    // Update the state of cards before retrieving changes from database
    this.setState({
      cards: []
    })

    // Create a reference all events the current user own
    eventKeys.map(key => {
      const ref = fb.eventsRef.child("events").child(key);

      // Evaluate whether the ref isn't null
      if (ref != null) {
        ref.on('value', snapshot => {
          const event = snapshot.val();
          this.didUpdate(event, eventKeys, key);
        });
      }
      return null;
    });
  }

  componentDidMount() {
    // Create a referene to the current user
    const myEventsRef = fb.userRef.child("events").child(this.state.credentials.uid);

    // Shouldn't be null. if it is, do nothing
    if (myEventsRef != null) {
      myEventsRef.on('value', snapshot => {  
	// Do nothing when it's null
        if (snapshot.val() != null) {
          const mykeys = Object.values(snapshot.val())
          //retrieve data from database using this reference
          this.getData(mykeys);
        }
      });
    }
  }

  async showModal (props) {
    await this.setState({
      showConfirmModal: true,
    })
    ReactDOM.render(
      <div>
       <ConfirmDelete 
        show={this.state.showConfirmModal}
        onHide={this.hideModal.bind(this)}
        uid={this.state.credentials.uid}
        reference={props} />
      </div>,
      document.getElementById('modal-wrapper')
    );
  }

  async hideModal() {
    await this.setState({
      showConfirmModal: false,
    })
    const modal = document.getElementById('modal-wrapper');
    ReactDOM.unmountComponentAtNode(modal);
  }

  handleEdit(key, event) {
    this.props.history.push({
      pathname: '/update',
      state: {eventObject: event, reference: key, loggedIn: true, credentials: this.state.credentials, plus_code: this.props.history.location.state.plus_code}
    })
  }

  renderProfile() {
    return (   
      <div className="profileContent">
	<Row>
	  <Col>
	    <h1 className="subtitle1">Profile</h1>
	  </Col>
	</Row>
        <hr/>
        <Row> 
	  <Col md={{ span: 4, offset: 4 }} >
	    <div className="profilephoto">
	      <Image
      		style={{
		  width: "300px",
		  height: "300px",
		  display: "block",
		  margin: "auto",
		}}
      		roundedCircle
      		src={this.state.profilePicture}
		alt="" /> 
	    </div>
	  </Col>
      	</Row>
        <br/>
	<Row> 
	  <Col md={{ span: 4, offset: 4 }}>
	    <h1 className="profile-name">John Doe</h1>
	    <br />
      	    <h1 className="profile-email">jdoe@osu.edu</h1>
      	    <br />
	    <h1 className="profile-university">The Ohio State University</h1>
	  </Col>
	</Row>
      </div>
    );
  }

  renderEvents() {
    return ( 
      <div>
	<Row>
	  <Col>
	    <h1 className="subtitle1">Events</h1>
	  </Col>
	</Row>
        <hr/>
	<div 
	  id="content"
	  style={{
	    marginLeft:"1.8rem",
	    marginTop:".8rem"}}>
	  <br />
      	  {this.state.contents}
	</div>
      </div>
    );
  }

  render() {
    return (
      <div>
        <TopNavbar 
      	  loggedIn={true}
      	  history={this.props.history} 
      	  credentials={this.state.credentials} 
      	  plus_code={this.props.history.location.state.plus_code}/>
        <Jumbotron>
      	  {this.renderProfile()}
          {this.renderEvents()}
	</Jumbotron>
      </div> 
    )
  }
}

export default Profile;
