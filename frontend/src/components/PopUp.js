import React, { Component } from 'react';
import { Modal, Button} from 'react-bootstrap';

export default class PopUp extends Component {

  render() {
    return(
      <Modal
        {...this.props}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered>
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
          Error:
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{this.props.message}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={this.props.onHide}>Close</Button>
        </Modal.Footer>
      </Modal>
    )
  }
}
