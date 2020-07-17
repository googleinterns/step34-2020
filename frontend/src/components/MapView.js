import React, { Component } from 'react';
import { Map, GoogleApiWrapper } from 'google-maps-react';
import { connect } from "react-redux";

const mapStateToProps = state => {
  return { articles: state.articles };
};

const mapStyles = {
  width: '100%',
  height: '100%'
};

class MapView extends Component {
  constructor() {
    super();

    this.state = {};
  }

  render() {
    return (
      <div>
        {this.props.articles.map(article => {
          return (
            <Map
              key={article.toString()}
              google={this.props.google}
              zoom={17}
              style={mapStyles}
              initialCenter={{
                lat: article.location.lat(),
                lng: article.location.lng()
              }}
              center={{
                lat: article.location.lat(),
                lng: article.location.lng()
              }}
            />
          )
        })}
      </div>
    )
  }
}

const ConnectMapViewToStore = connect(mapStateToProps);

export default GoogleApiWrapper({
  apiKey: 'API-KEY'
})(ConnectMapViewToStore(MapView));
