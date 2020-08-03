import React, { Component } from 'react';
import { Badge, Card, Carousel, Container, Col, Image, Row } from 'react-bootstrap';
import AccessTimeIcon from '@material-ui/icons/AccessTime';
import GroupIcon from '@material-ui/icons/Group';
import StarBorderIcon from '@material-ui/icons/StarBorder';
import { connect } from "react-redux";
import CheckCircleOutlinedIcon from '@material-ui/icons/CheckCircleOutlined';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import PlaceIcon from '@material-ui/icons/Place';
import moment from 'moment';

const mapStateToProps = state => {
  return { articles: state.articles };
}

const CHECK_CIRCLE_ICON_STYLE = {
  color: "#1CA45C",
  padding: 0,
  fontSize: "60px"
};

const STAR_BORDER_ICON_STYLE = {
    color: "#ffe733",
    padding: 0,
    fontSize: "60px"
};

class EventSidePanel extends Component {
  constructor(props) {
    super(props);

    var info = {};

    this.convertImagesIntoCarouselItems = this.convertImagesIntoCarouselItems.bind(this);
    this.checkGoing = this.checkGoing.bind(this);
  }

  convertImagesIntoCarouselItems() {
    var length = 0;
    var imageUrl = "";
    var allImages = "";

    if (this.props.event.imageUrls !== undefined) {
      length = this.props.event.imageUrls.length;
    }

    if (length > 0) {
      imageUrl = this.props.event.imageUrls.slice(1, length - 2);
      imageUrl = imageUrl.split(",");
      allImages = imageUrl.map((url, index) =>
        <Carousel.Item key={index}>
          <Image
            className="rounded"
            fluid
            src={url}
          />
        </Carousel.Item>
      );
    }

    const numAttendees = this.props.event.attendees.length;
    var allAttendees = this.props.event.attendees.slice(1, numAttendees - 1).split(",");
    var attendeesLength = allAttendees.length;

    var startTime = moment(this.props.event.startTime, 'HH:mm').format('h:mm a');
    var endTime = moment(this.props.event.endTime, 'HH:mm').format('h:mm a');
    var date = moment(this.props.event.date, 'YYYY-MM-DD').format('MMM  Do');

    var newInfo = {
      images: allImages,
      num: attendeesLength,
      startTime: startTime,
      endTime: endTime,
      date: date,
      attendees: allAttendees 
    };

    this.info = newInfo;
  }

  checkGoing(attendees) {
    const reduxState = this.props.articles[0];
    if (!reduxState.credentials) {
      return (
        <CheckCircleOutlinedIcon style={CHECK_CIRCLE_ICON_STYLE}/>
      );
    }

    const uid = reduxState.credentials.uid;
    const found = attendees.find(element => element === uid);

    if (!found) {
      return (
        <CheckCircleOutlinedIcon style={CHECK_CIRCLE_ICON_STYLE}/>
      );
    } else {
      return (
        <CheckCircleIcon style={CHECK_CIRCLE_ICON_STYLE}/>
      );
    }
  }

  render() {
    this.convertImagesIntoCarouselItems();
    return (
      <Container>
        <Card
          className="event-cards"
          key={Math.random(1001,5000)}
          text={'light' ? 'dark' : 'white'}>
        <Carousel className="fill-parent">
          {this.info.images}
        </Carousel>
        <Card.Body>
          <Card.Title>
            <h1 className="event-cards-title">{this.props.event.eventName}</h1>
          </Card.Title>
          <div className="event-text">
            <Row>
              <Col xs={1}>
                <PlaceIcon />
              </Col>
              <Col>
                {this.props.event.locationName}
              </Col>
            </Row>
          </div>
          <div>
            <Row>
              <Col xs={1}>
                <AccessTimeIcon />
              </Col>
              <Col>
                {this.info.date}, {this.info.startTime} - {this.info.endTime}
              </Col>
            </Row>
          </div>
          <div>
            <Row>
              <Col xs={1}>
                <GroupIcon />
              </Col>
              <Col>
                {this.info.num} attending
              </Col>
            </Row>
          </div>
          <hr />
          <Card.Text className="event-cards-description">
            About
          </Card.Text>
          <Card.Text>{this.props.event.description}</Card.Text>
          <Badge variant="secondary">
            {this.props.event.category}
          </Badge>
          <hr />
          <Row className = "justify-content-md-center">
            <Col md="auto">
              {this.checkGoing(this.attendees)}
              <div className="event-cards-attendText">Going</div>
            </Col>
            <Col md="auto">
              <StarBorderIcon style={STAR_BORDER_ICON_STYLE}/>
              <div className="event-cards-attendText">Interested</div>
            </Col>
          </Row>
        </Card.Body>
        </Card>
      </Container>
    );
  }
}

const ConnectedEventSidePanel = connect(
  mapStateToProps,
  null
)(EventSidePanel);

export default ConnectedEventSidePanel;
