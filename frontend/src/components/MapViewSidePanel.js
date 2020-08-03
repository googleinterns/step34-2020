import React, { Component } from 'react';
import { Accordion, Card, Toast, Form } from 'react-bootstrap';
import EventFilter from './EventFilter';
import Searchbar from './Searchbar';

// initialize global constant values
const KEY = "0";

const SELECT_PLACEHOLDER = "Enter university";
const EVENT_INFO_TEXT = "Start by clicking on an event!";

const ENTER_UNI_TOAST_STYLE = {
  backgroundColor: "white",
  position: "absolute",
  zIndex: 2,
  border: 0,
  borderRadius: "1rem",
  padding: 0,
  minWidth: "25rem",
  float: "right",
  margin: "1rem"
};
const EVENT_INFO_TOAST_STYLE = {
  backgroundColor: "white",
  position: "absolute",
  zIndex: 2,
  border: 0,
  borderRadius: "1rem",
  padding: 0,
  minWidth: "25rem",
  maxHeight: "80vh",
  float: "right",
  margin: "1rem",
  marginTop: "13rem"
};
const CARD_STYLE = {
  border: 0
};
const FORM_CONTROL_STYLE = {
  border: 0,
  focusOutline: "none"
}

class MapViewSidePanel extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div>
        <Toast style={ENTER_UNI_TOAST_STYLE}>
          <Toast.Body>
            <Card style={CARD_STYLE}>
              <Searchbar
                style={FORM_CONTROL_STYLE}
                rerenderParentCallback={this.props.rerenderParentCallback}/>
            </Card>
            <hr/>
            <Card
              style={CARD_STYLE}
              id="eventInfo">
              <Accordion defaultActiveKey={KEY}>
                <Accordion.Collapse eventKey={KEY}>
                  <EventFilter />
                </Accordion.Collapse>
              </Accordion>
            </Card>
          </Toast.Body>
        </Toast>
        <Toast style={EVENT_INFO_TOAST_STYLE}>
          <Toast.Body id="event-info">
            {EVENT_INFO_TEXT}
          </Toast.Body>
        </Toast>
      </div>
    )
  }
}

export default MapViewSidePanel;
