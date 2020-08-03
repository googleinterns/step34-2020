import React from 'react';
import { Row, Col, Image } from 'react-bootstrap';

const COL_STYLE = {
  span: 4,
  offset: 4
};
const IMAGE_STYLE = {
  width: '300px',
  height: '300px',
  display: 'block',
  margin: 'auto'
};

class Profile extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return(
      <div className="profileContent">
        <Row>
          <Col>
            <h1 className="subtitle1">Profile</h1>
          </Col>
        </Row>
        <hr />
        <Row>
          <Col md={COL_STYLE}>
            <div className="profilephoto">
              <Image
                style={IMAGE_STYLE}
                roundedCircle
                src={this.props.info.profilePicture}
                alt="" />
            </div>
          </Col>
        </Row>
        <br />
        <Row>
          <Col md={COL_STYLE}>
            <h1 className="profile-name">{this.props.info.displayName}</h1>
            <br/>
            <h1 className="profile-email">{this.props.info.email}</h1>
            <br/>
          </Col>
        </Row>
      </div>
    );
  }
}

export default Profile;