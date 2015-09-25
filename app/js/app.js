'use strict';

import React from 'react';
import Router, {Route, DefaultRoute, RouteHandler} from 'react-router';

import Index from './pages/Index';
import Login from './pages/Login';

class App extends React.Component {
  render() {
    return (
      <main>
        <RouteHandler />
      </main>
    );
  }
}

const routes = (
  <Route name="app" path="/" handler={App}>
    <DefaultRoute name="index" handler={Index} />
    <Route name="login" handler={Login} />
  </Route>
);

document.addEventListener('DOMContentLoaded', () => {
  Router.run(routes, Handler => {
    React.render(<Handler />, document.body);
  });
});
