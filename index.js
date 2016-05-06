var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');

app.get('/', function(req, res){
  res.sendFile(path.join(__dirname, 'index.html'));
});

var peopleonline = [];  
var messages = [];

io.on('connection', function(socket){
	
	io.emit('old messages',messages);

	socket.send(socket.id);

	socket.on('chat message', function(msg){
		io.emit('chat message',{'msg': msg.msg, 'name':msg.name});
		messages.push([msg.name, msg.msg]);
	});

	socket.on('new user',function(name){
		peopleonline.push(name);
		io.emit('peopleonline', peopleonline);
	});

	socket.on('end',function(name){
		var index = peopleonline.indexOf(name);
		peopleonline.splice(index, 1);
		io.emit('peopleonline', peopleonline);
	});

	socket.on('typing',function(name){
		io.emit('typing', name);
	});

});

http.listen(3000, function(){
  console.log('listening on *:3000');
});