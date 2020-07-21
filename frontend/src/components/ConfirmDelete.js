import React, { Component } from 'react';
import { Modal, Button} from 'react-bootstrap';
import { fb } from '../App';

export default class ConfirmDelete extends Component {
  handleDelete() {
    // delete event from entire database
    fb.eventsRef.child("events").child(this.props.reference).remove();

    //delete event from user's table
    fb.userRef.child("events").child(this.props.uid).child(this.props.reference).remove();

    // hide the modal
    this.props.onHide();
  }

  render() {
    return(
      <Modal
      {...this.props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered>
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
        WARNING: This event will be deleted permenantly
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Please confirm you want to delete this event.<br />
          All data associated with this event will be delete.<br />
          <br />
        </p>
        <h5>Note:</h5>
        <p>You cannot undo the changes after you select confirm</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="success" onClick={this.handleDelete.bind(this)}>Confirm</Button>
        <Button variant="danger" onClick={this.props.onHide}>Cancel</Button>
      </Modal.Footer>
    </Modal>
    )
  }
}