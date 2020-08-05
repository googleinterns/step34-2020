import React from 'react';
import './App.css';
import { Router, Switch, Route } from 'react-router-dom';
import MapViewPage from './pages/MapViewPage';
import { createBrowserHistory } from 'history';
import Welcome from './components/Welcome';
import ProfilePage from './pages/ProfilePage';
import Firebase from './components/Firebase';
import Events from './pages/CreateEventPage';
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
            <Route path="/profile" component={ProfilePage} />
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
