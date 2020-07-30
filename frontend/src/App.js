import React from 'react';
import './App.css';
import { Router, Switch, Route } from 'react-router-dom';
import MapViewPage from './pages/MapViewPage';
import { createBrowserHistory } from 'history';
import Welcome from './components/Welcome';
import Profile from './components/Profile';
import Firebase from './components/Firebase';
import Events from './components/CreateEvent';
import Footer  from './components/Footer';
import Update from './components/UpdateEvent';

const history = createBrowserHistory();

function App() {
  return (
    <div className="page-container">
      <Router history={history}>
        <div>
          <Switch>
            <Route exact path="/"  component={Welcome} />
            <Route path="/map" component={MapViewPage} />
            <Route path="/profile" component={Profile} />
            <Route path="/create" component={Events} />
            <Route path="/update" component={Update} />
          </Switch>
        </div>
      </Router>
      <Footer />
    </div>
  );
}

export const fb = new Firebase();
export default App;
