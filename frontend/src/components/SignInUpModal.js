import React, { Component } from 'react';
import ReactModalLogin from 'react-modal-login';
import Profile from './Profile';
import ReactDOM from 'react-dom';
import Auth from './auth';


export default class LogInUp extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showModal: true,
      loggedIn: false,
      loading: false,
      error: null,
      initialTab: 'login',
      recoverPasswordSuccess: null,
    };
  }

  onLogin() {
    const email = document.querySelector('#email').value;
    const password = document.querySelector('#password').value;

    if (!email || !password) {
      this.setState({
        error: true
      })
    } else {
      Auth.login({email: email, password: password});
      if (Auth.isAuthenticated()) {
        this.onLoginSuccess('form');
      } else {
        this.onLoginFail('form', 'Incorrect password')
      }
    }
  }

  onRegister() {
    const nickname = document.querySelector('#nickname').value;
    const email = document.querySelector('#email').value;
    const password = document.querySelector('#password').value;
    const university = document.querySelector('#university').value;
    const confirmpassword = document.querySelector('#confirmpassword').value;

    if (!nickname || !email || !password) {
      this.setState({
        error: true
      })
    } else {
      Auth.signup({
        nickname: nickname,
        email: email,
        university: university,
        password:password,
        confirmpassword: confirmpassword
      })
      
      if (Auth.isAuthenticated()) {
        this.onLoginSuccess('form');
      } else {
        this.onLoginFail('form', 'Incorrect password')
      }
      
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

  onLoginSuccess(method, response) {
    this.closeModal();
    this.setState({
      loggedIn: method,
      loading: false
    })
  }

  onLoginFail(method, response) {
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
      loading: false
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
    if (Auth.isAuthenticated()) {
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
                label: 'Email',
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
