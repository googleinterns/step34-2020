import React, { Component } from "react";
import ReactDOM from "react-dom";
import { InfoWindow } from "google-maps-react";
import '../App.css';

class EventInfoWindow extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: true
    }
    this.infoWindowRef = React.createRef();
    this.contentElement = document.createElement(`div`);
  }

  hide() {
    this.setState({visible: false});
  }

  show() {
    this.setState({visible: true});
  }
  
  componentDidUpdate(prevProps) {
    if (this.props.children !== prevProps.children) {
      ReactDOM.render(
        React.Children.only(this.props.children),
        this.contentElement
      );
      this.infoWindowRef.current.infowindow.setContent(this.contentElement);
    }
  }

  render() {
    return (
      <InfoWindow
        ref={this.infoWindowRef} {...this.props}
        visible={this.state.visible} />
    );
  }
}

export default EventInfoWindow;
