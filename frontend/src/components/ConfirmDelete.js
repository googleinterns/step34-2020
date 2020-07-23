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
