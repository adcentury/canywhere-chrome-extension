var baseUrl;
var socket;
var $input;

init();


function init() {
  baseUrl = 'http://localhost:3000';
  chrome.runtime.onInstalled.addListener(function() {
    registerContextMenus();
  });
  var username = localStorage.getItem('username');
  if (username != null && username != 'null') {
    login(username, localStorage.getItem('password'));
  }
  $input = $('<input>');
  $('body').html($input);
}
function registerContextMenus() {
  var contexts = ['page', 'selection', 'link', 'editable', 'image', 'video', 'audio'];
  var regContexts = {
    'selection': '选择文本',
    'link': '链接地址',
    'image': '图片网址'
  };
  var value;

  for (var k in regContexts) {
    value = regContexts[k];
    chrome.contextMenus.create({
      'title': '云拷贝' + value,
      'contexts': [k],
      'id': k
    });
    contexts.splice(contexts.indexOf(k), 1);
  }
  chrome.contextMenus.create({
    'title': '云拷贝网页地址',
    'contexts': contexts,
    'id': 'url'
  });
  chrome.contextMenus.onClicked.addListener(onClickHandler);

  function onClickHandler(info, tab) {
    if (localStorage.getItem('hasLogin') !== 'true') {
      alert('请先使用“Canywhere”工具栏按钮登陆');
      return;
    }
    var text;
    if (info.menuItemId === 'selection') {
      text = info.selectionText;
    } else if (info.menuItemId === 'link') {
      text = info.linkUrl;
    } else if (info.menuItemId === 'image') {
      text = info.srcUrl;
    } else if (info.menuItemId === 'url') {
      text = info.pageUrl;
    }
    emitMessage(text);
  }
}

function createNotifications(title, content, device) {
  return chrome.notifications.create({
    type: 'basic',
    iconUrl: 'i/' + device + '-icon.png',
    title: title,
    message: content.length > 60 ? content.substring(0, 58) + '...' : content
  });
}

function login(username, password) {
  var url = baseUrl + '/users/session';
  $.ajax({
    url: url,
    method: 'POST',
    data: {
      username: username,
      password: password
    }
  })
    .done(function(res) {
      if (res.result === 'error') {
        alert('登陆Canywhere失败，请使用工具栏按钮退出后重新登陆');
        logout();
        return;
      }
      localStorage.setItem('hasLogin', 'true');
      connect(res.token);
    })
    .fail(function(xhr, status, err) {
      alert('登陆Canywhere失败，请使用工具栏按钮退出后重新登陆');
      logout();
      return;
    });
}

function logout() {
  localStorage.removeItem('hasLogin');
  localStorage.removeItem('uuid');
  localStorage.removeItem('username');
  localStorage.removeItem('password');

  if (socket) {
    socket.disconnect();
  }
}

function connect(token) {
  var url = baseUrl + '/messages';
  socket = io.connect(url, {query: 'auth_token=' + token});
  listenOnMessage();
}

function listenOnMessage() {
  socket.on('message', function(data) {
    var message = data.message;
    var time = message.createAt;

    if (time === localStorage.getItem('latestTime')) {
      return;
    }

    $input.val(message.text).select();
    document.execCommand('copy');
    localStorage.setItem('latestTime', message.createAt);

    var title = moment(message.createAt).format('YYYY-MM-DD HH:mm:ss') +
      ' 复制于 ' + message.device;
    var content = message.text;
    createNotifications(title, content, message.device);
  });
}

function emitMessage(text) {
  socket.emit('new', {
    message: {
      device: 'chrome',
      text: text
    }
  });
}
