'use strict';

import React from 'react';

import $ from 'jquery';

import Container from '../../../node_modules/amazeui-react/lib/Container';
import Form from '../../../node_modules/amazeui-react/lib/Form';
import Input from '../../../node_modules/amazeui-react/lib/Input';
import Button from '../../../node_modules/amazeui-react/lib/Button';

import {LOGOUT_URL} from '../utils/Const';

export default class Index extends React.Component {
  constructor(props) {
    super(props);
    if (localStorage.getItem('hasLogin') !== 'true') {
      // disable render
      this.render = () => {
        return false;
      };
      window.location.replace('popup.html#/login');
    }
  }
  _logout() {
    chrome.runtime.getBackgroundPage(function (bg) {
      bg.logout();
    });
    window.location.replace('popup.html#/login');
  }
  render() {
    return (
      <Container className="ca-container">
        <Form horizontal>
          <Button amStyle="danger" onClick={this._logout}>退出登陆</Button>
        </Form>
      </Container>
    );
  }
}
