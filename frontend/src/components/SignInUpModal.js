import React, { Component } from 'react';
import ReactModalLogin from 'react-modal-login';
import ReactDOM from 'react-dom';
import { fb } from '../App';
import firebase from 'firebase';
import { changeMapState } from "../actions/index";
import { connect } from "react-redux";
import zxcvbn from 'zxcvbn';
import tldjs from 'tldjs';

const { getDomain, getPublicSuffix } = tldjs

function mapDispatchToProps(dispatch) {
  return {
    changeMapState: mapState => dispatch(changeMapState(mapState))
  };
}

const mapStateToProps = state => {
  return { articles: state.articles };
}

class LogInAndSignUp extends Component {
  constructor(props) {
    super(props);

    this.reduxState = this.props.articles[0];

    this.state = {
      loggedIn: false,
      showModal: true,
      loading: false,
      error: null,
      initialTab: 'login',
      recoverPasswordSuccess: null,
      credentials: null,
    };
  }

  updateRedux(userCredentials, userLoggedIn) {
    // update redux
    const currentState = {
      location: this.reduxState.location,
      lat: this.reduxState.lat,
      lng: this.reduxState.lng,
      locationObject: this.reduxState.locationObject,
      plusCode: this.reduxState.plusCode,
      loggedIn: userLoggedIn,
      credentials: userCredentials
    }

    this.props.changeMapState(currentState);  
    this.reduxState = this.props.articles[0];
  }

  onLogin() {
    const email = document.querySelector('#email').value;
    const password = document.querySelector('#password').value;

    //sign in the user
    firebase.auth().signInWithEmailAndPassword(email, password)
      .then (async response => {
        this.setState({credentials: response.user, loggedIn: true})
        await this.updateRedux(response.user, true);
        this.onLoginSuccess()})
      .catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        if (errorCode === 'auth/wrong-password') {
          alert('Wrong password.');
        } else {
          alert(errorMessage);
        }
        console.log(error);
      });
  }

  async onRegister() {
    const nickname = document.querySelector('#nickname').value;
    const email = document.querySelector('#email').value;
    const password = document.querySelector('#password').value;
    const confirmpassword = document.querySelector('#confirmpassword').value;
    const domain = getDomain(email);
    const suffix = getPublicSuffix(domain);
    const passIsValid = this.passwordStrength(password);


    if (confirmpassword === password){
      //validate that email provided is a student email and password is strong enough
      if (passIsValid && suffix === 'edu') {
        // Create user account, sign them in, then retrieve credentials
        let response = await fb.requestUserSignUpAndListenForResponse(email, password, nickname);
        if (response != null) {
          this.setState({credentials: response.user, loggedIn: true})
          this.updateRedux(response.user, true);
          this.onLoginSuccess()
        }
      } else if (suffix !== 'edu') {
        alert('email should be .edu')
      } else {
        alert('password is short or weak')
      }
    } else {
      alert("Passwords don't match. Please try again")
    }
  }

  async onRecoverPassword() {
    const email = document.querySelector('#email').value;

    firebase.auth().sendPasswordResetEmail(email, null)
      .then(response => {
        //password reset email sent
       this.onRecoverPasswordSuccess();
      })
      .catch(function(error) {
          alert(error.message)
      });
  }

  onLoginSuccess() {
    this.closeModal();
    this.setState({
      loading: false,
      loggedIn: true,
    })

    if (this.props.articles) {
      if (this.reduxState) {
        if (this.state.loggedIn && this.reduxState.credentials) {
          this.props.history.push({
            pathname: '/profile'
          })
        }
      }
    }
  }

  onLoginFail(response) {
    this.setState({
      loading: false,
      error: response
    })
  }

  onRecoverPasswordSuccess() {
    this.setState ({
      error: null,
      recoverPasswordSuccess: true
    })
  }

  startLoading() {
    this.setState({
      loading: true
    })
  }

  finishLoading() {
    this.setState({
      loading: false,
      showModal: true
    })
  }

  afterTabsChange() {
    this.setState({
      error: null,
      recoverPasswordSuccess: false,
    });
  }

  closeModal() {
    this.setState({
      showModal: false,
      error: null
    });
    const modal = document.getElementById('modal-wrapper');
    ReactDOM.unmountComponentAtNode(modal);
  }

  // Evaluates the strength of the password user provided
  passwordStrength(password) {
    const strength = zxcvbn(password).score;
    const len = password.length;

    if (strength >= 3 && len >= 16) {
      return true;
    } 
    return false;
  }

  render() {
    const isLoading = this.state.loading;
    return (
      <div>
        {/* returns the modal with all necessary components */}
        <ReactModalLogin
          visible={this.state.showModal}
          onCloseModal={this.closeModal.bind(this)}
          loading={isLoading}
          initialTab={this.state.initialTab}
          error={this.state.error}
          tabs={{
            afterChange: this.afterTabsChange.bind(this)
          }}
          startLoading={this.startLoading.bind(this)}
          finishLoading={this.finishLoading.bind(this)}
          form={{
            onLogin: this.onLogin.bind(this),
            onRegister: this.onRegister.bind(this),
            onRecoverPassword: this.onRecoverPassword.bind(this),

            recoverPasswordSuccessLabel: this.state.recoverPasswordSuccess
              ? {
                  label: "New password has been sent to your mailbox!"
                }
              : null,
            recoverPasswordAnchor: {
              label: "Forgot your password?"
            },
            loginBtn: {
              label: "Sign in"
            },
            registerBtn: {
              label: "Sign up"
            },
            recoverPasswordBtn: {
              label: "Send new password"
            },
            loginInputs: [
              {
                containerClass: 'RML-form-group',
                label: 'University Email',
                type: 'email',
                inputClass: 'RML-form-control',
                id: 'email',
                name: 'email',
                placeholder: 'Email',
              },
              {
                containerClass: 'RML-form-group',
                label: 'Password',
                type: 'password',
                inputClass: 'RML-form-control',
                id: 'password',
                name: 'password',
                placeholder: 'Password',
              }
            ],
            registerInputs: [
              {
                containerClass: 'RML-form-group',
                label: 'Name',
                type: 'text',
                inputClass: 'RML-form-control',
                id: 'nickname',
                name: 'nickname',
                placeholder: 'name',
              },
              {
                containerClass: 'RML-form-group',
                label: 'University Email',
                type: 'email',
                inputClass: 'RML-form-control',
                id: 'email',
                name: 'email',
                placeholder: 'Email',
              },
              {
                containerClass: 'RML-form-group',
                label: 'Password, Note: it should be at least 16 characters/A mixture of uppercase and lowercase letters/numbers/special character e.g., ! @ # ?',
                type: 'password',
                inputClass: 'RML-form-control',
                id: 'password',
                name: 'password',
                placeholder: 'Password',
              },
              {
                containerClass: 'RML-form-group',
                label: 'Confirm Password',
                type: 'password',
                inputClass: 'RML-form-control',
                id: 'confirmpassword',
                name: 'confirmpassword',
                placeholder: 'Password',
              }
            ],
            recoverPasswordInputs: [
              {
                containerClass: 'RML-form-group',
                label: 'Email',
                type: 'email',
                inputClass: 'RML-form-control',
                id: 'email',
                name: 'email',
                placeholder: 'Email',
              },
            ],
          }}/>
      </div>
    )
  }
}

const ConnectedLogInAndSignUp = connect(
  mapStateToProps,
  mapDispatchToProps
)(LogInAndSignUp);

export default ConnectedLogInAndSignUp;
