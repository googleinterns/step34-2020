import React, { Component } from 'react';
import { changeMapState } from "../actions/index";
import { connect } from "react-redux";
import { Button, Form } from 'react-bootstrap';

// initialize global constant values
const NONE_SELECTED_KEY = "";
const SOCIAL_GATHERING_KEY = "0";
const VOLUNTEER_EVENT_KEY = "1";
const STUDENT_ORGANIZATION_EVENT_KEY = "2";

const SOCIAL_GATHERING = "Social Gathering";
const VOLUNTEER_EVENT = "Volunteer Event";
const STUDENT_ORGANIZATION_EVENT = "Student Organization Event";
const NO_FILTER_SELECTED = null;

function mapDispatchToProps(dispatch) {
  return {
    changeMapState: mapState => dispatch(changeMapState(mapState))
  };
}

const mapStateToProps = state => {
  return { articles: state.articles };
}

class EventFilter extends Component {
  constructor(props) {
    super(props);
    this.reduxState = this.props.articles[0];

    if (this.reduxState) {
      this.state = {
        location: this.reduxState.location,
        lat: this.reduxState.lat,
        lng: this.reduxState.lng,
        loggedIn: this.reduxState.loggedIn,
        plusCode: this.reduxState.plusCode,
        credentials: this.reduxState.credentials
      };
    }

    // initialize global values that can change
    this.isChecked = false;

    this.handleFilterChange = this.handleFilterChange.bind(this);
    this.updateReduxState = this.updateReduxState.bind(this);
    this.handleDateChange = this.handleDateChange.bind(this);
    this.handleFilterClearChange = this.handleFilterClearChange.bind(this);
  }

  async handleFilterClearChange() {
    var category = this.reduxState.filter_choice;
    var date = this.date;
    this.updateReduxState(this.isChecked, category, date);
  }

  async handleDateChange(input) {
    this.updateReduxState(!this.isChecked, this.filter_choice, input.target.value)
  }

  async handleFilterChange(input) {
    let filter_choice = NO_FILTER_SELECTED;
    switch (input.target.value) {
      case SOCIAL_GATHERING_KEY:
        filter_choice = SOCIAL_GATHERING;
        break;

      case VOLUNTEER_EVENT_KEY:
        filter_choice = VOLUNTEER_EVENT;
        break;
      
      case STUDENT_ORGANIZATION_EVENT_KEY:
        filter_choice = STUDENT_ORGANIZATION_EVENT;
        break;
    
      default:
        break;
    }
    this.updateReduxState(this.state.isChecked, filter_choice, this.state.date);
  }

  async updateReduxState(isChecked, filter_choice, date) {
    const updatedState = {
      location: this.state.location,
      lat: this.state.lat,
      lng: this.state.lng,
      locationObject: this.state.locationObject,
      plusCode: this.state.plusCode,
      loggedIn: this.state.loggedIn,
      credentials: this.state.credentials,
      filter_choice: filter_choice,
      isChecked: isChecked,
      date: date
    }

    await this.props.changeMapState(updatedState);
    this.reduxState = this.props.articles[0];
    this.setState(updatedState);
  }

  render() {
    return(
      <Form>
        <Form.Control
          onChange={this.handleFilterChange}
          as="select"
          className="my-1 mr-sm-2"
          id="categoriesSelect"
          custom="true">
          <option value={NONE_SELECTED_KEY}>Filter</option>
          <option value={SOCIAL_GATHERING_KEY}>Social Gathering</option>
          <option value={VOLUNTEER_EVENT_KEY}>Volunteer Event</option>
          <option value={STUDENT_ORGANIZATION_EVENT_KEY}>Student Organization Event</option>
        </Form.Control>
        <Form.Group>
          <Form.Control
            required
            onChange={this.handleDateChange}
            type="date"
            label="choose a date"/>
      	</Form.Group>
      	<Form.Group>
          <Button
      		className="btn btn-sm"
            onClick={this.handleFilterClearChange}
            variant="primary"
            label="clear filters">Clear Filters</Button>
        </Form.Group>
      </Form>
    )
  }
}

const ConnectedEventFilter = connect(
  mapStateToProps,
  mapDispatchToProps
)(EventFilter);

export default ConnectedEventFilter;
