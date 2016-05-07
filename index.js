var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');


var url = 'mongodb://localhost:27017/chat';

// MongoClient.connect(url, function(err, db) {
//   assert.equal(null, err);
//   console.log("Connected correctly to server.");
//   db.close();
// });

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
		if(index >= 0){
			peopleonline.splice(index, 1);
			io.emit('peopleonline', peopleonline);
		}
	});

	socket.on('typing',function(name){
		io.emit('typing', name);
	});

});

MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  chat(db,'ali','bye', function() {
      db.close();
  });
});


var chat = function(db,name,msg, callback) {
  var content = {};
  content[name] = [msg,new Date()];
   db.collection('chat').insertOne( {
      content[name]
   }, function(err, result) {
    assert.equal(err, null);
    console.log("Inserted a document into the restaurants collection.");
    callback();
  });
};


http.listen(3000, function(){
  console.log('listening on *:3000');
});