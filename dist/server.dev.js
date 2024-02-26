"use strict";

var express = require('express');

var app = express(); // const cors = require('cors')
// app.use(cors())

var server = require('http').Server(app);

var io = require('socket.io')(server);

var _require = require('peer'),
    ExpressPeerServer = _require.ExpressPeerServer;

var peerServer = ExpressPeerServer(server, {
  debug: true
});

var _require2 = require('uuid'),
    uuidV4 = _require2.v4;

app.use('/peerjs', peerServer);
app.set('view engine', 'ejs');
app.use(express["static"]('public'));
app.get('/', function (req, res) {
  res.redirect("/".concat(uuidV4()));
});
app.get('/:room', function (req, res) {
  res.render('room', {
    roomId: req.params.room
  });
});
io.on('connection', function (socket) {
  socket.on('join-room', function (roomId, userId) {
    socket.join(roomId);
    socket.to(roomId).broadcast.emit('user-connected', userId); // messages

    socket.on('message', function (message) {
      //send message to the same room
      io.to(roomId).emit('createMessage', message);
    });
    socket.on('disconnect', function () {
      socket.to(roomId).broadcast.emit('user-disconnected', userId);
    });
  });
});
server.listen(process.env.PORT || 5030);