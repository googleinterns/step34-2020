import React from 'react';
import './App.css';
import { Router, Switch, Route } from 'react-router-dom';
import MapViewPage from './pages/MapViewPage';
import { createBrowserHistory } from 'history';
import Welcome from './components/Welcome';
import Firebase from './components/Firebase';


const history = createBrowserHistory();

function App() {
  return (
    <Router history={history}>
      <div>
        <Switch>
          <Route exact path="/"  component={Welcome} />
          <Route path="/map" component={MapViewPage} />
        </Switch>
      </div>
    </Router>
  );
}

export const fb = new Firebase();
export default App;
