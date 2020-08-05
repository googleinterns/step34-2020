import React from 'react';
import './App.css';
import { Router, Switch, Route } from 'react-router-dom';
import MapViewPage from './pages/MapViewPage';
import { createBrowserHistory } from 'history';
import Welcome from './components/Welcome';
import ProfilePage from './pages/ProfilePage';
import Firebase from './components/Firebase';
import CreateEventPage from './pages/CreateEventPage';
import Footer  from './components/Footer';
import UpdateEventPage from './pages/UpdateEventPage';

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
            <Route path="/create" component={CreateEventPage} />
            <Route path="/update" component={UpdateEventPage} />
          </Switch>
        </div>
      </Router>
      <Footer />
    </div>
  );
}

export const fb = new Firebase();
export default App;
