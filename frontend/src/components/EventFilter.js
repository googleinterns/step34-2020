import React, { Component } from 'react';
import { changeMapState } from "../actions/index";
import { connect } from "react-redux";
import { Form } from 'react-bootstrap';

// initialize global constant values
const NONE_SELECTED_KEY = "";
const SOCIAL_GATHERING_KEY = "0";
const VOLUNTEER_EVENT_KEY = "1";
const STUDENT_ORGANIZATION_EVENT_KEY = "2";

const SOCIAL_GATHERING = "Social Gathering";
const VOLUNTEER_EVENT = "Volunteer Event";
const STUDENT_ORGANIZATION_EVENT = "Student Organization Event";
const NO_FILTER_SELECTED = null;

const CHECKBOX_TEXT = "Show today's events";

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

    this.handleFilterChange = this.handleFilter.bind(this);
    this.handleCheckboxChange = this.handleCheckboxChange.bind(this);
    this.updateReduxState = this.updateReduxState.bind(this);
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
    this.updateReduxState(filter_choice);
  }

  async handleCheckboxChange() {
    this.isChecked = !this.isChecked;
    this.updateReduxState(this.reduxState.filter_choice);
  }

  async updateReduxState(filter_choice) {
    const updatedState = {
      location: this.state.location,
      lat: this.state.lat,
      lng: this.state.lng,
      locationObject: this.state.locationObject,
      plusCode: this.state.plusCode,
      loggedIn: this.state.loggedIn,
      credentials: this.state.credentials,
      filter_choice: filter_choice,
      isChecked: this.isChecked
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
      <Form.Check
        onChange={this.handleCheckboxChange}
        defaultChecked={this.isChecked}
        type="checkbox"
        label={CHECKBOX_TEXT}/>
      </Form>
    )
  }
}

const ConnectedEventFilter = connect(
  mapStateToProps,
  mapDispatchToProps
)(EventFilter);

export default ConnectedEventFilter;
