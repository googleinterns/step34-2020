import React from 'react';
import './App.css';
import { BrowserRouter as Router, Switch, Route} from 'react-router-dom';
import Welcome from './components/Welcome';
import Firebase from './components/Firebase';
import Auth from './components/auth';


function App() {
  return (
      <Router>
        <div>
          <Switch>
            <Route exact path="/"  component={Welcome} />
            {/* <Route exact path="/profile" component={Profile} /> */}
          </Switch>
        </div>
      </Router>
  );
}

export const fb = new Firebase();
export const authStatus = new Auth();

export default App;
