import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Badge, Card, Carousel, Col, Image, Row } from 'react-bootstrap';
import placeIcon from '../place-24px.svg';
import ButtonToolBar from 'react-bootstrap/ButtonToolbar';
import Button from 'react-bootstrap/Button';
import ConfirmDelete from '../components/ConfirmDelete';
import { changeMapState } from "../actions/index";
import { connect } from "react-redux";
import moment from 'moment';
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

const EDIT_BUTTON_STYLING = {
  marginRight: ".8rem",
  width: "80px"
};
const DELETE_BUTTON_STYLING = {
  width: "80px"
};

class ProfileEventCard extends Component {
  constructor(props) {
    super(props);
    var info = {};
    this.createImageCards = this.createImageCards.bind(this);
    this.reduxState = this.props.articles[0];

    this.showModal = this.showModal.bind(this);
    this.hideModal = this.hideModal.bind(this);
    this.handleEdit = this.handleEdit.bind(this);
    this.updateReduxState = this.updateReduxState.bind(this);
    this.redirectPage = this.redirectPage.bind(this);
  }

  createImageCards() {
    var info = this.props.info;

    if (info.event) {
      var attendees = info.event.attendees.slice(1, info.event.attendees.length - 1).split(",");

      let num = attendees.length;
      var len = 0;
      var imageUrl = "";
      var card = "";

      if (info.event.imageUrls) {
        len = info.event.imageUrls.length;
      }

      if (len >= 1) {
        imageUrl = info.event.imageUrls.slice(1, len - 2);
        imageUrl = imageUrl.split(',');

        card = imageUrl.map(url =>
          <Carousel.Item>
            <Image
              className="rounded"
              fluid
              src={url} />
          </Carousel.Item>
        );
      }

      let startTime = moment(info.event.startTime, 'HH:mm').format('h:mm a');
      let endTime = moment(info.event.endTime, 'HH:mm').format('h:mm a');
      let date = moment(info.event.date, 'YYYY-MM-DD').format('MMM  Do');

      var newInfo = {
        credentials: info.credentials,
        event: info.event,
        card: card,
        startTime: startTime,
        endTime: endTime,
        date: date,
        eventName: info.event.eventName,
        locationName: info.event.locationName,
        num: num,
        description: info.event.description,
        category: info.event.category,
        ref: info.ref
      };
      this.info = newInfo;
    }
  }

  async showModal(ref) {
    await this.setState({
      showConfirmModal: true
    });
    ReactDOM.render(
      <div>
        <ConfirmDelete
          show={this.state.showConfirmModal}
          onHide={this.hideModal.bind(this)}
          uid={this.info.credentials}
          reference={ref}/>
      </div>,
      document.getElementById('modal-wrapper')
    );
  }

  async hideModal() {
    await this.setState({
      showConfirmModal: false,
    });
    const modal = document.getElementById('modal-wrapper');
    ReactDOM.unmountComponentAtNode(modal);
  }

  handleEdit(key, event) {
    this.updateReduxState(key, event);
    this.redirectPage('/update');
  }

  redirectPage(pathname) {
    this.props.history.push({
      pathname: pathname
    })
  }

  updateReduxState(key, event) {
    const updatedState = {
      location: this.reduxState.location,
      lat: this.reduxState.lat,
      lng: this.reduxState.lng,
      locationObject: this.reduxState.locationObject,
      plusCode: this.reduxState.plusCode,
      loggedIn: this.reduxState.loggedIn,
      credentials: this.reduxState.credentials,
      eventObject: event,
      reference: key
    };
    this.props.changeMapState(updatedState);
    this.reduxState = this.props.articles[0];
  }

  render() {
    this.createImageCards();
    return (
      <div>
        <Col className="event-col" md="auto">
          <Card
            className="shadow mb-5 bg-white rounded event-cards"
            key={Math.random(1001,5000)}
            text={'light' ? 'dark' : 'white'}>
            <Carousel className="fill-parent">
              {this.info.card}
            </Carousel>
            <Card.Body>
              <Card.Title>
                <h1 className="event-cards-title">{this.info.eventName}</h1>
              </Card.Title>
              <Row>
                <Col md="auto">
                  <Image md="auto" src={placeIcon}/>
                </Col>
                <Col md="auto">
                  <Card.Text className="event-text">{this.info.locationName}</Card.Text>
                </Col>
              </Row>
              <Row md="auto">
                <Col>
                  <Image md="auto" src={timeIcon} />
                </Col>
                <Col>
                  <Card.Text>{this.info.date}, {this.info.startTime} - {this.info.endTime}</Card.Text>
                </Col>
              </Row>
              <Row>
                <Col>
                  <Image md="auto" src={groupIcon}/>
                </Col>
                <Col md="auto">
                  <Card.Text>{this.info.num} attending</Card.Text>
                </Col>
              </Row>
              <hr />
              <Card.Text className="event-cards-description">About</Card.Text>
              <Card.Text>{this.info.description}</Card.Text>
              <Badge variant="secondary">{this.info.category}</Badge>
              <hr />
              <ButtonToolBar className="float-right">
                <Button
                  variant="primary"
                  style={EDIT_BUTTON_STYLING}
                  onClick={() => this.handleEdit(this.info.ref, this.info.event)}>
                  Edit
                </Button>
                <Button
                  variant="danger"
                  style={DELETE_BUTTON_STYLING}
                  onClick={() => this.showModal(this.info.ref)}>
                  Delete
                </Button>
              </ButtonToolBar>
            </Card.Body>
          </Card>
        </Col>
      </div>
    );
  }
}

const ConnectedProfileEventCard = connect(
  mapStateToProps,
  mapDispatchToProps
)(ProfileEventCard);

export default ConnectedProfileEventCard;
