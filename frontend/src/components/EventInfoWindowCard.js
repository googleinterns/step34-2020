import React, { Component } from 'react';
import { Badge, Card } from 'react-bootstrap';
import PlaceIcon from '@material-ui/icons/Place';
import AccessTimeIcon from '@material-ui/icons/AccessTime';

class EventInfoWindowCard extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <Card.Body>
          <Card.Title>{this.props.eventInfo.eventName}</Card.Title>
          <hr />
          <Card.Text>
            <PlaceIcon />
            {this.props.eventInfo.locationName}
          </Card.Text>
          <Card.Text>
            <AccessTimeIcon />
              {this.props.eventInfo.date}, {this.props.eventInfo.startTime} - {this.props.eventInfo.endTime}
          </Card.Text>
          <Badge variant="secondary">
            {this.props.eventInfo.category}
          </Badge>
          <hr />
        </Card.Body>
      </div>
    );
  }
}

export default EventInfoWindowCard;