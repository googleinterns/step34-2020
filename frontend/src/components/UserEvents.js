import React from 'react';
import { Row, Col } from 'react-bootstrap';

const CONTENT_STYLING = {
  marginLeft: "1.8rem",
  marginTop: ".8rem"
};

class UserEvents extends React.Component {
  render() {
    return(
      <div>
        <Row>
          <Col>
           <h1 className="subtitle1">Events</h1>
          </Col>
        </Row>
        <hr />
        <div
          id="content"
          style={CONTENT_STYLING}>
          <br />
          {this.props.contents}
        </div>
      </div>
    );
  }
}

export default UserEvents;