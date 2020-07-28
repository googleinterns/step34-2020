import React, { Component } from 'react';
import { Modal, Button} from 'react-bootstrap';
import { fb } from '../App';

export default class ConfirmDelete extends Component {

  handleDelete() {
    // Get uid and event id from props
    let uid = this.props.uid;
    let eventId = this.props.reference;
    console.log(this.props);
    let isSuccess = fb.requestEventDeletion(eventId, uid);
    
    // Check if the response is success
    // If success then hide the modal, if not send in an alert
    if (isSuccess) {
      this.props.onHide();
    } else {
      this.onDeleteFailed();
    }
  }

  onDeleteFailed() {
    alert("Something went wrong deleting the event. Please try again.");
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
          <p>This event will be permenantly deleted and all user going to this event will be removed from the event list.
          </p>
          <h5>Note:</h5>
          <p>You cannot undo the changes after you confirm</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={this.handleDelete.bind(this)}>Delete Event</Button>
          <Button variant="outline-secondary" onClick={this.props.onHide}>Cancel</Button>
        </Modal.Footer>
      </Modal>
    )
  }
}
