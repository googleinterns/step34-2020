import React from 'react';
import TopNavbar from './Navbar';
import '../App.css';
import Button from 'react-bootstrap/Button';
import { fb } from '../App';

class Profile extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      profilePicture: "https://images.unsplash.com/photo-1503249023995-51b0f3778ccf?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=400&q=60",
      username: props.credentials.displayName,
      credentials: props.credentials,
      eventslist: [],
      userslist: [],
    };
  }

  renderEditButton() {
    return (
        <Button style={{
          backgroundColor:"green",
          marginRight:".5rem",
          width:"80px",
          marginBottom:".8rem"}}>
          edit 
        </Button>
    )
  }

  renderDeleteButton() {
    return (
      <Button style={{
        backgroundColor:"red",
        width:"80px",
        marginBottom:".8rem"}}>
        delete
      </Button>
    )
  }


  didUpdate(event) {
    var attendees = ["user1", "user2", "user3"];
    var content = document.getElementById("content");

    // Add first part of component before list of attendees
    content.innerHTML += 
      "<div class='otherContent'>"+
        "<label>" + event.eventName + "</label><br />"+
        "<label>" +  event.date + "</label><br />" +
        "<label>" +  event.location + "</label><br />" +
        "<label>" + event.startTime + " - " + event.endTime + "</label><br /></div>";

    // Add list of attendees to a drop down  list
    var Attendeeslist = "<select>" + 
          "<option>Attendees</option>";
    attendees.forEach(element => {
      Attendeeslist += "<option>" + element + "</option>"
    });

    // Add the remaining part of the component after list of attendees
    content.innerHTML += "<div class='eventContent'>" + Attendeeslist +
        "</select><br /><br />" +
        "<Button class='deleteButton'>delete</Button> " + 
        "<Button class='editButton'>edit</Button><br /><br />" + 
      "</div>";
  }

  getData(eventKeys){
    // call the server to retrieve all necessary information about user
    eventKeys.map(key => {
      const ref = fb.eventsRef.child("events").child(key);
      ref.on('value', snapshot => {
        const event = snapshot.val();
        this.didUpdate(event);
        this.state.eventslist.push(event)
      });
    });
  }

  writeData(){
    // Use .set method to save changes.
    // userdb.ref().set()
  }

  componentDidUpdate() {
    // This will retrieve all events info from the server.
    const myEventsRef = fb.userRef.child("events").child(this.state.credentials.uid);
    myEventsRef.on('value', snapshot => {
      // snapshot.val().map (key => this.state.eventslist.push(key))
      const mykeys = Object.keys(snapshot.val())
      this.getData(mykeys)
    });
  }

  render() {
    return (
      <div class="body">
        <TopNavbar loggedIn={true} credentials={this.state.credentials}/>
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
