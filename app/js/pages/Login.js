'use strict';

import React from 'react';

import $ from 'jquery';

import Container from '../../../node_modules/amazeui-react/lib/Container';

import LoginForm from '../components/LoginForm';

import {LOGIN_URL} from '../utils/Const';

export default class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      submiting: false,
      feedback: ''
    };
    this._handleFormSubmit = this._handleFormSubmit.bind(this);
  }
  _handleFormSubmit(data) {
    if (!data.username) {
      this.setState({feedback: '请输入用户名'});
      return;
    }
    if (!data.password) {
      this.setState({feedback: '请输入密码'});
      return;
    }

    this.setState({
      submiting: true,
      feedback: ''
    });

    $.ajax({
      url: LOGIN_URL,
      method: 'POST',
      data: data
    })
      .done(res => {
        if (res.result === 'error') {
          this.setState({feedback: res.messages.join('；')});
          return;
        }
        localStorage.setItem('hasLogin', 'true');
        localStorage.setItem('uuid', res.uuid);
        localStorage.setItem('username', data.username);
        localStorage.setItem('password', data.password);
        localStorage.setItem('token', res.token);

        chrome.runtime.getBackgroundPage(function(bg) {
          bg.connect(res.token);
        });

        window.location.replace('popup.html#/');
      })
      .fail((xhr, status, err) => {
        if (xhr.status === 401) {
          this.setState({feedback: '用户名或密码错误'});
        } else {
          this.setState({feedback: err.toString()});
        }
      })
      .complete(() => {
        this.setState({submiting: false});
      });
  }
  render() {
    return (
      <Container className="ca-container">
        <LoginForm
          submiting={this.state.submiting}
          feedback={this.state.feedback}
          onFormSubmit={this._handleFormSubmit} />
      </Container>
    );
  }
}
