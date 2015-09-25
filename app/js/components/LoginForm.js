'use strict';

import React from 'react';

import Form from '../../../node_modules/amazeui-react/lib/Form';
import Input from '../../../node_modules/amazeui-react/lib/Input';
import Button from '../../../node_modules/amazeui-react/lib/Button';

export default class LoginForm extends React.Component {
  constructor(props) {
    super(props);
    this._handleSubmit = this._handleSubmit.bind(this);
  }
  _handleSubmit(e) {
    e.preventDefault();

    this.props.onFormSubmit({
      username: this.refs.username.getValue(),
      password: this.refs.password.getValue()
    });
  }
  render() {
    var feedback = this.props.feedback ?
      <p className="ca-form-feedback">{this.props.feedback}</p> :
      null;
    var submitButton = this.props.submiting ?
      <Button type="submit" amStyle="primary" disabled>登录中…</Button> :
      <Button type="submit" amStyle="primary">登录</Button>;

    return (
      <Form className="ca-form" onSubmit={this._handleSubmit}>
        <fieldset>
          <legend>请登录</legend>
          <Input
            ref="username" name="username"
            label="用户名：" placeholder="请输入用户名" />
          <Input
            type="password" ref="password" name="password"
            label="密码：" placeholder="请输入密码" />
          {feedback}
          <p>
            {submitButton}
          </p>
        </fieldset>
      </Form>
    );
  }
}

LoginForm.propTypes = {
  onFormSubmit: React.PropTypes.func,
  feedback: React.PropTypes.node,
  submiting: React.PropTypes.bool
};
