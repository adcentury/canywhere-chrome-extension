var SERVER_URL = 'http://localhost:3000';

var SOCKET_SERVER_URL = 'http://localhost:3000';

module.exports = {
  LOGIN_URL: SERVER_URL + '/users/session',
  LOGOUT_URL: SERVER_URL + '/logout',
  REGISTER_URL: SERVER_URL + '/users',
  SOCKET_MESSAGES_URL: SOCKET_SERVER_URL + '/messages'
};
