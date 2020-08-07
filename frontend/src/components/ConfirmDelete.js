import React, { Component } from 'react';
import { Modal, Button} from 'react-bootstrap';
import { fb } from '../App';

const DELETE_FAILED_ALERT = "Something went wrong while deleting the event.  Please try again.";
const DELETE_EVENT_CONFIRM = "The event will be permanently deleted and all attendees will be removed from the event list.";
const DELETE_EVENT_WARNING = "WARNING: This event will be deleted permanently";
const DELETE_EVENT_NOTE = "This action cannot be undone";

export default class ConfirmDelete extends Component {
  handleDelete() {
    let uid = this.props.uid;
    let eventId = this.props.reference;
    let isSuccess = fb.requestEventDeletion(eventId, uid);
    
    // If success then hide the modal, if not send in an alert
    if (isSuccess) {
      this.props.onHide();
    } else {
      this.onDeleteFailed();
    }
  }

  onDeleteFailed() {
    alert(DELETE_FAILED_ALERT);
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
          {DELETE_EVENT_WARNING}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{DELETE_EVENT_CONFIRM}</p>
          <h5>Note:</h5>
          <p>{DELETE_EVENT_NOTE}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="danger"
            onClick={this.handleDelete.bind(this)}>Delete Event</Button>
          <Button
            variant="outline-secondary"
            onClick={this.props.onHide}>Cancel</Button>
        </Modal.Footer>
      </Modal>
    )
  }
}
