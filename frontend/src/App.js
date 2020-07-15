import React from 'react';
import './App.css';
import { Router, Switch, Route } from 'react-router-dom';
import MapViewPage from './pages/MapViewPage';
import { createBrowserHistory } from 'history';
import Welcome from './components/Welcome';
import Profile from './components/Profile';
import Firebase from './components/Firebase';
import Create from './components/CreateEvent';

const history = createBrowserHistory();

function App() {
  return (
    <Router history={history}>
      <div>
        <Switch>
          <Route exact path="/"  component={Welcome} />
          <Route path="/map" component={MapViewPage} />
          <Route path="/profile" component={Profile} />
          <Route path="/create" component={Create} />
        </Switch>
      </div>
    </Router>
  );
}

export const fb = new Firebase();
export default App;
