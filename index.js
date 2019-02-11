let app = require('express')();
let http = require('http').Server(app);
let io = require('socket.io')(http);

io.on('connection', (socket) => {

  socket.on('create', function(room) {
    socket.join(room);
    io.emit('room', {room: room});
    console.log('sala ' + room);
  });

  socket.on('disconnect', function(){
    io.emit('users-changed', {user: socket.nickname, event: 'left'});
  });

  socket.on('myId', (myId) => {
    io.emit('id', {id: myId, event: 'nuevo peer'});
  });

  socket.on('set-nickname', (nickname) => {
    socket.nickname = nickname;
    io.emit('users-changed', {user: nickname, event: 'joined'});
    console.log('nick ' + nickname);
  });

  socket.on('add-message', (message) => {
    io.emit('message', {text: message.text, from: socket.nickname, isImage: message.isImage, created: new Date()});
    console.log('mensaje ' + message.text + ' de ' + socket.nickname);
  });

});

var port = process.env.PORT || 3001;

http.listen(port, function(){
   console.log('listening in http://localhost:' + port);
});
