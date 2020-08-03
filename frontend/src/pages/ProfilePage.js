import React from 'react';
import ReactDOM from 'react-dom';
import TopNavbar from '../components/Navbar';
import '../App.css';
import { Badge, Carousel, Image, Container, Jumbotron, Row, Col } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import ButtonToolBar from 'react-bootstrap/ButtonToolbar';
import { fb } from '../App';
import Card from 'react-bootstrap/Card';
import { changeMapState } from "../actions/index";
import { connect } from "react-redux";
import ConfirmDelete from '../components/ConfirmDelete';
import Profile from '../components/Profile';
import UserEvents from '../components/UserEvents';
import moment from 'moment';
import placeIcon from '../place-24px.svg';
import timeIcon from '../access_time-24px.svg';
import groupIcon from '../group-24px.svg';

const PROFILE_PICTURE = "https://moonvillageassociation.org/wp-content/uploads/2018/06/default-profile-picture1.jpg";

function mapDispatchToProps(dispatch) {
  return {
    changeMapState: mapState => dispatch(changeMapState(mapState))
  };
}

const mapStateToProps = state => {
  return { articles: state.articles };
}

class ProfilePage extends React.Component {
  constructor(props) {
    super(props);

    this.reduxState = this.props.articles[0];

    if (this.reduxState) {
      this.state = {
        loggedIn: this.reduxState.loggedIn,
        credentials: this.reduxState.credentials,
        profilePicture: PROFILE_PICTURE,
        cards: [],
        showConfirmModal: false,
        contents: null
      };
    } else {
      window.location = "/";
    }

    this.showModal =  this.showModal.bind(this);
    this.hideModal = this.hideModal.bind(this);
    this.handleEdit = this.handleEdit.bind(this);
  }

  didUpdate(event, parent, ref) {
    if(event !== null) {
      var attendees = event.attendees.slice(1, event.attendees.length -1).split(",");

      let num = attendees.length;
      var len = 0;
      var imageUrl = "";
      var card = "";

      // Since images are option field, evaluate whether the field isn't null
      if (event.imageUrls !== undefined) {
        len = event.imageUrls.length;
      }
            
      // Retrieve image urls only if they were provided. Otherwise set url to default value
      if(len >= 1) {
        imageUrl = event.imageUrls.slice(1, len - 2);
        imageUrl = imageUrl.split(",");
        // dynamically create a card that contain images for the event
        card = imageUrl.map(url =>
          <Carousel.Item>
            <Image className="rounded" fluid src={url} />
          </Carousel.Item>
        );
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
        contents:
          <Container className="event-container" fluid>
            <Row 
              className="d-flex flex-row flex-nowrap">
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
    const myEventsRef = fb.userRef.child("events").child(this.state.credentials.uid);

    if (myEventsRef != null) {
      myEventsRef.on('value', snapshot => {
        // Do nothing when it's null
        if (snapshot.val() != null) {
          const mykeys = Object.values(snapshot.val())
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
    this.reduxState = this.props.articles[0];

    this.props.history.push({
      pathname: '/update',
    })
  }

  render() {
    if (this.reduxState) {
      var profileProps = {
        profilePicture: PROFILE_PICTURE,
        displayName: this.reduxState.credentials.displayName,
        email: this.reduxState.credentials.email
      }
      return (
        <div>
          <TopNavbar history={this.props.history}/>
          <Jumbotron>
            <Profile info={profileProps}/>
            <UserEvents contents={this.state.contents}/>
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
)(ProfilePage);

export default ConnectedProfile;
