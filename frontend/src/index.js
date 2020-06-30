import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import LandingPage from './pages/LandingPage';
import MapView from './components/mapView';
import * as serviceWorker from './serviceWorker';
import { Nav } from 'react-bootstrap';
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Link,
  Redirect
} from 'react-router-dom';

ReactDOM.render(
    <Router>
    	<Route exact path="/" component={LandingPage} />
        <Route exact path="/map" component={MapView} />
    </Router>, document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();