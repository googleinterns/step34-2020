import React from 'react';
import ReactDOM from 'react-dom';
import TopNavbar from './Navbar';
import '../App.css';
import Button from 'react-bootstrap/Button';
import { fb } from '../App';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';
import Card from 'react-bootstrap/Card';
import CardColumns from 'react-bootstrap/CardColumns'

class Profile extends React.Component {
  constructor(props) {
    super(props);

    const JSONString = props.history.location.state.credentials;
    const JSONObject = JSON.parse(JSONString);

    console.log(JSONObject);

    this.state = {
      profilePicture: "https://images.unsplash.com/photo-1503249023995-51b0f3778ccf?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=400&q=60",
      username: 'Tim',
      credentials: JSONObject,
      cards:[],
    };
  }


  didUpdate(event) {
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
      card = imageUrl.map(url => <Card.Img variant="top" src={url} />);
    }

    // Add this card to the list of all cards to be displayed on the profile
    this.state.cards.push(
      <Card>
        {card}
        {/* <Card.Img variant="top" src={imageUrl[0]} /> */}
        <Card.Body>
          <Card.Title>{event.eventName}</Card.Title>
          <Card.Text>
            {event.description}
          </Card.Text>
          <Card.Text>{event.location}</Card.Text>
          <Card.Text>{event.startTime} - {event.endTime}</Card.Text>
          <DropdownButton id="dropdown-basic-button" title="Attendees">
            {attendees.map(attendee => (
              <Dropdown.Item>{attendee}</Dropdown.Item>))}
          </DropdownButton><br />
          <Button variant="success" style={{ marginRight:".8rem", width:"80px" }}>
            Edit
          </Button>
          <Button variant="danger" style={{ width:"80px" }}>
            Delete
          </Button>
        </Card.Body>
      </Card>)

    ReactDOM.render( 
      <CardColumns>
        {this.state.cards.map(element   => element)}
      </CardColumns>,
      document.getElementById("content"))
  }

  getData(eventKeys){

    // Update the state of cards before retrieving changes from database
    this.setState({
      cards: []
    })

    // Create a reference all events the current user own
    eventKeys.map(key => {
      const ref = fb.eventsRef.child("events").child(key);
      ref.on('value', snapshot => {
        const event = snapshot.val();
        this.didUpdate(event);
      });
      return null;
    });
  }

  componentDidMount() {
    // Create a referene to the current user
    const myEventsRef = fb.userRef.child("events").child(this.state.credentials.uid);
    myEventsRef.on('value', snapshot => {
      // snapshot.val().map (key => this.state.eventslist.push(key))
      const mykeys = Object.keys(snapshot.val())

      //retrieve data from database using this reference
      this.getData(mykeys)
    });
  }

  render() {
    return (
      <div>
        <TopNavbar loggedIn={true} history={this.props.history} credentials={this.state.credentials}/>
        {/* get user profile picture and user name */}
        <div className="profilepictureContent" 
          style={{borderBottom:"4px solid grey"}}>
          <div className="profilephoto">
            <img style={{
              width:"180px",
              height:"180px",
              borderRadius:"80px"}}
              src={this.state.profilePicture}
              alt="" /> 
            <h4 style={{
              marginLeft:"1.8rem",
              marginTop:".8rem"}}>
                {this.state.username}
            </h4>
          </div>
        </div>
        <div 
          id="content"
          style={{
          marginLeft:"1.8rem",
          marginTop:".8rem"}}>
          <br />
        </div>
      </div>
    )
  }
}

export default Profile;
