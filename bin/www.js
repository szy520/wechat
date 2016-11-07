#!/usr/bin/env node

/**
 * Module dependencies.
 */

var app = require('../app');
var debug = require('debug')('myapp:server');
var http = require('http');
var moment = require('moment');

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '18080');
app.set('port', port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);
var webChannel = require('socket.io')(server);


//在线用户
var onlineUsers = {};
//当前在线人数
var onlineCount = 0;


webChannel.on('connection', function(socket){
  console.log("New Web connected");
  socket.on('login', function(obj){
    //将新加入用户的唯一标识当作socket的名称，后面退出的时候会用到
    socket.name = obj.userid;
    //检查在线列表，如果不在里面就加入
    if(!onlineUsers.hasOwnProperty(obj.userid)) {
      onlineUsers[obj.userid] = obj.username;
      //在线人数+1
      onlineCount++;
    }
    //向所有客户端广播用户加入
    webChannel.emit('login', {onlineUsers:onlineUsers, onlineCount:onlineCount, user:obj});
    console.log(obj.username+'加入了聊天室');
  });
  socket.on('logout', function(userinfo){
    if(onlineUsers.hasOwnProperty(userinfo.userid)) {
      //退出用户的信息
      var obj = {userid:userinfo.userid, username:onlineUsers[userinfo.userid]};

      //删除
      delete onlineUsers[userinfo.userid];
      //在线人数-1
      onlineCount--;

      //向所有客户端广播用户退出
      webChannel.emit('logout', {onlineUsers:onlineUsers, onlineCount:onlineCount, user:obj});
      console.log(userinfo.username+'退出了聊天室');
    }
    console.log("onlineUsers")
  });
  //监听用户退出
  socket.on('disconnect', function(){
    //将退出的用户从在线列表中删除
    if(onlineUsers.hasOwnProperty(socket.name)) {
      //退出用户的信息
      var obj = {userid:socket.name, username:onlineUsers[socket.name]};

      //删除
      delete onlineUsers[socket.name];
      //在线人数-1
      onlineCount--;

      //向所有客户端广播用户退出
      webChannel.emit('logout', {onlineUsers:onlineUsers, onlineCount:onlineCount, user:obj});
      console.log(obj.username+'退出了聊天室');
    }
  });

  //监听用户发布聊天内容
  socket.on('message', function(obj){
    //向所有客户端广播发布的消息
    obj.date = moment(new Date()).utcOffset(8).format('YYYY-MM-DD HH:mm:ss');
    webChannel.emit('message', obj);
  });


});

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
