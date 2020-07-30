import React, { Component } from 'react';
import { changeMapState } from "../actions.index";
import { connect } from "react-redux";
import { Form } from 'react-bootstrap';

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

    this.NONE_SELECTED = "";
    this.SOCIAL_GATHERING = "0";
    this.VOLUNTEER_EVENT = "1";
    this.STUDENT_ORGANIZATION_EVENT = "2"
    this.isChecked = false;

    this.handleFilter = this.handleFilter.bind(this);
    this.handleCheckbox = this.handleCheckbox.bind(this);
  }

  async handleFilter(input) {
    // Set filter category
    let filter_choice = null;
    switch (input.target.value) {
      case this.SOCIAL_GATHERING:
        filter_choice = "Social Gathering";
        break;

      case this.VOLUNTEER_EVENT:
        filter_choice = "Volunteer Event";
        break;
      
      case this.STUDENT_ORGANIZATION_EVENT:
        filter_choice = "Student Organization Event";
        break;
    
      default:
        break;
    }

    updateReduxState(filter_choice);
  }

  async handleCheckboxChange() {
    this.isChecked = !this.isChecked;
    updateReduxState(this.reduxState.filter_choice);
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
      <Form.Control
        onChange={this.handleFilter}
        as="select"
        className="my-1 mr-sm-2"
        id="categoriesSelect"
        custom="true">
        <option value={this.NONE_SELECTED}>Filter</option>
        <option value={this.SOCIAL_GATHERING}>Social Gathering</option>
        <option value={this.VOLUNTEER_EVENT}>Volunteer Event</option>
        <option value={this.STUDENT_ORGANIZATION_EVENT}>Student Organization Event</option>
      </Form.Control>
      <Form.Check
        onChange={this.handleCheckboxChange}
        defaultChecked={this.isChecked}
        type="checkbox"
        label="Show today's events"/>
    )
  }
}

const ConnectedEventFilter = connect(
  mapStateToProps,
  mapDispatchToProps
)(EventFilter);

export default ConnectedEventFilter;
