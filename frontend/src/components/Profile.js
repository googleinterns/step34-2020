import React from 'react';
import TopNavbar from './Navbar';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';
import Button from 'react-bootstrap/Button';
import { fb } from '../App';

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
      eventslist: [],
      userslist: [],
      events:[{
        title: 'Club fair',
        description: 'Learn about student organization on campus',
        starttime: '5pm',
        endtime: '7pm',
        location: '500 College Ave',
        attendees: ["John","Maya","Dan"],
        gallery: ["https://images.unsplash.com/photo-1579148428700-8f11fbb6b477?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=400&q=60",
        "https://www.usnews.com/dims4/USNEWS/f405c9a/17177859217/resize/800x540%3E/quality/85/?url=https%3A%2F%2Fmedia.beam.usnews.com%2F60%2F6e00b7a3707b65cf2a7fcf38ead436%2Fcollege-photo_8428.jpg"],
      },
      {
        title: 'iOS STEP intern pod sync',
        description: 'discuss the milestone of this week',
        starttime: '1pm',
        endtime: '1:30pm',
        location: 'GVC',
        attendees: ["John","Maya","Dan","Mico"],
        gallery: ["https://media.glassdoor.com/l/0c/38/d5/ea/google-inc.jpg",
        "https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcRX4k1e4FQQFM8FzvMD9lXFmdMj9E6TVM8jjQ&usqp=CAU"],
      }]
    };
  }

  getData(){
    // call the server to retrieve all necessary information about user
    const ref = fb.eventsRef.child("events");
    ref.on('value', snapshot => {
      const event = snapshot.val();
      this.state.eventslist.push(event)
    });
  }

  writeData(){
    // Use .set method to save changes.
    // userdb.ref().set()
  }

  componentDidMount() {
    // This will retrieve all events info from the server.
    const myevents = fb.userRef.child("events").child(this.state.credentials.uid);
    myevents.on('value', snapshot => {
      const event = snapshot.val();
      this.state.eventslist.push(event)
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
                {this.state.credentials.displayName}
            </h4>
          </div>
        </div>
        <div className="content">
        <br />
        {/* iterate through all events of the user*/}
        {this.state.events.map(event => (
          <div className="events" style={{
            display:"flex",
            justifyContent:"space-around",
            borderBottom:"1px solid grey",
            marginBottom:".5rem"}}>
            <div>
              <label>{event.title}</label><br />
              <label>{event.description}</label><br />
              <label>{event.location}</label><br />
              <label>{event.starttime} - {event.endtime}</label><br />
              {/* list all attendees */}
              <DropdownButton id="dropdown-basic-button" title="Attendees">
                {event.attendees.map(attendee => (
                  <Dropdown.Item>{attendee}</Dropdown.Item>))}
              </DropdownButton><br />
              <Button style={{
                backgroundColor:"green",
                marginRight:".5rem",
                width:"80px",
                marginBottom:".8rem"}}>
                edit 
              </Button>
              <Button style={{
                backgroundColor:"red",
                width:"80px",
                marginBottom:".8rem"}}>
                delete
              </Button>
            </div>
            <div className="Gallery">
              <img style={{width:"280px"}} src={event.gallery[0]} alt="" />
              <img style={{width:"280px"}} src={event.gallery[1]} alt="" />
            </div>
          </div>))}
        </div>
      </div>
    )	
  }
}

export default Profile;
