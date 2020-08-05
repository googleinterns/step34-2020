import React from 'react';
import TopNavbar from '../components/Navbar';
import '../App.css';
import { Container, Jumbotron, Row } from 'react-bootstrap';
import { fb } from '../App';
import { changeMapState } from "../actions/index";
import { connect } from "react-redux";
import Profile from '../components/Profile';
import ProfileEventCard from '../components/ProfileEventCard';
import UserEvents from '../components/UserEvents';

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
  }

  didUpdate(event, parent, ref) {
    var cardProps = {
      event: event,
      parent: parent,
      ref: ref,
      credentials: this.state.credentials
    }

    this.state.cards.push(
      <ProfileEventCard
        info={cardProps}
        history={this.props.history}/>
    );
 
      this.setState({
        contents:
          <Container className="event-container" fluid>
            <Row 
              className="d-flex flex-row flex-nowrap">
              {this.state.cards.map(element   => element)}
            </Row>
          </Container>
      });
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
