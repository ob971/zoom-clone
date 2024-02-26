"use strict";

var socket = io('/');
var videoGrid = document.getElementById('video-grid');
var myPeer = new Peer(undefined, {
  path: '/peerjs',
  host: '/',
  port: '443'
});
var myVideoStream;
var myVideo = document.createElement('video');
myVideo.muted = true;
var peers = {};
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(function (stream) {
  myVideoStream = stream;
  addVideoStream(myVideo, stream);
  myPeer.on('call', function (call) {
    call.answer(stream);
    var video = document.createElement('video');
    call.on('stream', function (userVideoStream) {
      addVideoStream(video, userVideoStream);
    });
  });
  socket.on('user-connected', function (userId) {
    connectToNewUser(userId, stream);
  }); // input value

  var text = $("input"); // when press enter send message

  $('html').keydown(function (e) {
    if (e.which == 13 && text.val().length !== 0) {
      socket.emit('message', text.val());
      text.val('');
    }
  });
  socket.on("createMessage", function (message) {
    $("ul").append("<li class=\"message\"><b>user</b><br/>".concat(message, "</li>"));
    scrollToBottom();
  });
});
socket.on('user-disconnected', function (userId) {
  if (peers[userId]) peers[userId].close();
});
myPeer.on('open', function (id) {
  socket.emit('join-room', ROOM_ID, id);
});

function connectToNewUser(userId, stream) {
  var call = myPeer.call(userId, stream);
  var video = document.createElement('video');
  call.on('stream', function (userVideoStream) {
    addVideoStream(video, userVideoStream);
  });
  call.on('close', function () {
    video.remove();
  });
  peers[userId] = call;
}

function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', function () {
    video.play();
  });
  videoGrid.append(video);
}

var scrollToBottom = function scrollToBottom() {
  var d = $('.main__chat_window');
  d.scrollTop(d.prop("scrollHeight"));
};

var muteUnmute = function muteUnmute() {
  var enabled = myVideoStream.getAudioTracks()[0].enabled;

  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
};

var playStop = function playStop() {
  console.log('object');
  var enabled = myVideoStream.getVideoTracks()[0].enabled;

  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo();
  } else {
    setStopVideo();
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
};

var setMuteButton = function setMuteButton() {
  var html = "\n    <i class=\"fas fa-microphone\"></i>\n    <span>Mute</span>\n  ";
  document.querySelector('.main__mute_button').innerHTML = html;
};

var setUnmuteButton = function setUnmuteButton() {
  var html = "\n    <i class=\"unmute fas fa-microphone-slash\"></i>\n    <span>Unmute</span>\n  ";
  document.querySelector('.main__mute_button').innerHTML = html;
};

var setStopVideo = function setStopVideo() {
  var html = "\n    <i class=\"fas fa-video\"></i>\n    <span>Stop Video</span>\n  ";
  document.querySelector('.main__video_button').innerHTML = html;
};

var setPlayVideo = function setPlayVideo() {
  var html = "\n  <i class=\"stop fas fa-video-slash\"></i>\n    <span>Play Video</span>\n  ";
  document.querySelector('.main__video_button').innerHTML = html;
};