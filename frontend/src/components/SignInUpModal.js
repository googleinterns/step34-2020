import React, { Component } from 'react';
import ReactModalLogin from 'react-modal-login';
import Profile from './Profile';
import ReactDOM from 'react-dom';
import { fb, authStatus } from '../App';
import firebase, { auth } from 'firebase';


export default class LogInUp extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loggedIn: false,
      showModal: true,
      loading: false,
      error: null,
      initialTab: 'login',
      recoverPasswordSuccess: null,
    };
  }

  onLogin() {
    const email = document.querySelector('#email').value;
    const password = document.querySelector('#password').value;

    //sign in the user
    firebase.auth().signInWithEmailAndPassword(email, password)
        .then ( response => this.onLoginSuccess())
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
    const university = document.querySelector('#university').value;
    const confirmpassword = document.querySelector('#confirmpassword').value;

    // Create user account and sign them in
    // isSuccess is a boolean whether or not the sign up was successful
    let isSuccess = await fb.requestUserSignUpAndListenForResponse(email, password, nickname);
    if (isSuccess) {
      this.onLoginSuccess();
    }
  }

  onRecoverPassword() {
    console.log('__onFotgottenPassword__');
    console.log('email: ' + document.querySelector('#email').value);

    const email = document.querySelector('#email').value;

    if (!email) {
      this.setState({
        error: true,
        recoverPasswordSuccess: false
      })
    } else {
      this.setState({
        error: null,
        recoverPasswordSuccess: true
      });
    }
  }

  openModal(initialTab) {
    this.setState({
      initialTab: initialTab
    }, () => {
      this.setState({
        showModal: true,
      })
    });
  }

  onLoginSuccess() {
    this.closeModal();
    this.setState({
      loading: false,
      loggedIn: true,
    })
    authStatus.login();
  }

  onLoginFail(response) {
    this.setState({
      loading: false,
      error: response
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
  }

  render() {
    if (this.state.loggedIn) {
      ReactDOM.render(
        <div>
          <Profile />
        </div>,
        document.getElementById('welcome'))
    }
        
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
                label: 'Nickname',
                type: 'text',
                inputClass: 'RML-form-control',
                id: 'nickname',
                name: 'nickname',
                placeholder: 'Nickname',
              },
              {
                containerClass: 'RML-form-group',
                label: 'University name',
                type: 'text',
                inputClass: 'RML-form-control',
                id: 'university',
                name: 'university',
                placeholder: 'University/college',
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
                label: 'Password',
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
        {/* {loggedIn} */}
      </div>
    )
  }
}
