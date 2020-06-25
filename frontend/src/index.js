import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Welcome from './components/welcome';
import * as serviceWorker from './serviceWorker';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

ReactDOM.render(
    <MuiThemeProvider>
        <Welcome /> 
    </MuiThemeProvider>, document.getElementById('welcome')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
