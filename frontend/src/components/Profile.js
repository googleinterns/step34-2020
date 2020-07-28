import React from 'react';
import ReactDOM from 'react-dom';
import TopNavbar from './Navbar';
import '../App.css';
import { Badge, Carousel, CardDeck, Image, Container, Jumbotron, Nav, Tab, Row, Col } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import ButtonToolBar from 'react-bootstrap/ButtonToolbar';
import Firebase from 'firebase';
import { fb } from '../App';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';
import Card from 'react-bootstrap/Card';
import CardColumns from 'react-bootstrap/CardColumns';
import { changeMapState } from "../actions/index";
import { connect } from "react-redux";
import ConfirmDelete from './ConfirmDelete';
import moment from 'moment';
import placeIcon from '../place-24px.svg';
import timeIcon from '../access_time-24px.svg';
import groupIcon from '../group-24px.svg';

function mapDispatchToProps(dispatch) {
  return {
    changeMapState: mapState => dispatch(changeMapState(mapState))
  };
}

const mapStateToProps = state => {
  return { articles: state.articles };
}

class Profile extends React.Component {
  constructor(props) {
    super(props);

    if (this.reduxState) {
      this.state = {
        loggedIn: this.reduxState.loggedIn,
        credentials: this.reduxState.credentials,
        profilePicture: "https://moonvillageassociation.org/wp-content/uploads/2018/06/default-profile-picture1.jpg",
        cards: [],
        showConfirmModal: false,
        contents: null
      };
    } else {
      window.location = "/";
    }

    console.log(this.state.credentials);
    this.showModal =  this.showModal.bind(this);
    this.hideModal = this.hideModal.bind(this);
    this.handleEdit = this.handleEdit.bind(this);
    
  }

  didUpdate(event, parent, ref) {
    if(event !== null) {
      var attendees = ["user1", "user2", "user3"];
      let num = attendees.length;
      var len = 0;
      var imageUrl = "";
      var card = "";

      // Since images are option field, evaluate whether the field isn't null
      if (event.imageUrls != null) {
	len = event.imageUrls.length;
      }
      // Retrieve image urls only if they were provided. Otherwise set url to default value
      if(len > 0) {
	imageUrl = event.imageUrls.slice(1, len - 2);
	imageUrl = imageUrl.split(",");
	console.log(imageUrl);
	// dynamically create a card that contain images for the event
	card = imageUrl.map(url => 
	  <Carousel.Item>
	    <Image className="rounded" fluid src={url} />
	  </Carousel.Item>);
      }
      
      let startTime = moment(event.startTime, 'HH:mm').format('h:mm a');
      let endTime = moment(event.endTime, 'HH:mm').format('h:mm a');
      let date = moment(event.date, 'YYYY-MM-DD').format('MMM  Do');

      // Add this card to the list of all cards to be displayed on the profile
      this.state.cards.push(
	<Col className="event-col" md="auto">
	  <Card
	    className="shadow mb-5 bg-white rounded event-cards"
	    key={Math.random(1001,5000)} 
	    text={'light' ? 'dark' : 'white'}>
	    <Carousel className="fill-parent">
	      {card}
	    </Carousel>
	    <Card.Body>
	      <Card.Title>
		<h1 className="event-cards-title">{event.eventName}</h1>
	      </Card.Title>
	      <Row>
		<Col md="auto">
		  <Image md="auto" src={placeIcon}/>
		</Col>
		<Col md="auto">	
		  <Card.Text className="event-text">{event.locationName}</Card.Text>
		</Col>
	      </Row>
	      <Row md="auto">
		<Col>
		  <Image md="auto" src={timeIcon}/>
		</Col>
		<Col md="auto">	
		  <Card.Text>{date}, {startTime} - {endTime}</Card.Text>
		</Col>
	      </Row>
	      <Row md="auto">
		<Col>
		  <Image md="auto" src={groupIcon}/>
		</Col>
		<Col md="auto">	
		  <Card.Text>{num} attending</Card.Text>
		</Col>
	      </Row>
	      <hr/>
	      <Card.Text className="event-cards-description">
		About
	      </Card.Text>
	      <Card.Text>{event.description}</Card.Text>
	      <Badge variant="secondary">
		{event.category}
	      </Badge>
	      <hr/>
	      <ButtonToolBar className="float-right">
		<Button 
		variant="primary"
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
	  </Card>
	</Col>
      );


      this.setState({
        contents: <Container className="event-container" fluid>
		    <Row className="d-flex flex-row flex-nowrap">
                      {this.state.cards.map(element   => element)}
		    </Row>
                  </Container>
      })
    }
    
  }

  getData(eventKeys) {

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
    // add event and key to redux store
    const currentState = {
      location: this.reduxState.location,
      lat: this.reduxState.lat,
      lng: this.reduxState.lng,
      locationObject: this.reduxState.locationObject,
      plusCode: this.reduxState.plusCode,
      loggedIn: this.reduxState.loggedIn,
      credentials: this.reduxState.credentials,
      eventObject: event,
      reference: key
    }
    this.props.changeMapState(currentState);

    this.props.history.push({
      pathname: '/update',
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
    if (this.reduxState) {
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
    } else {
      window.location = '/';
      return null;
    }
  }
}

const ConnectedProfile = connect(
  mapStateToProps,
  mapDispatchToProps
)(Profile);

export default ConnectedProfile;
