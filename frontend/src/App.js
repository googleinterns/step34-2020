import React from 'react';
import './App.css';
import { BrowserRouter as Router, Switch, Route} from 'react-router-dom';
import Welcome from './components/Welcome';
import Firebase from './Firebase';

const fb = new Firebase();

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

export default App;
