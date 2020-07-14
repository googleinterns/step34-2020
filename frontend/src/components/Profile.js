import React from 'react';
import TopNavbar from './Navbar';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';
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

  /*
  renderButtons() {
    return (
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
    )
  }
*/

  didUpdate(event) {
    console.log(event);
    var content = document.getElementById("events");
    content.innerHTML += "<div><label>{" + event.eventName + "}</label><br /><label>{" + event.date + "}</label><br /><label>{" + event.location + "}</label><br /><label>{" + event.startTime + "} - {" + event.endTime + "}</label><br /><br /></div>";
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
    console.log(this.state.eventslist)
    console.log(this.state.eventslist)
    return (
      <div>
        <TopNavbar loggedIn={true}/>
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
        <div className="content">
          <br />
	  <div id="events" className="events" style={{
	    display:"flex",
	    justifyContent:"space-around",
	    borderBottom:"1px solid grey",
	    marginBottom:".5rem"}}>
	  </div>
        </div>
      </div>
    )	
  }
}

export default Profile;
