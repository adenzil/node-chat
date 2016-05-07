var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');


var url = 'mongodb://localhost:27017/chat';

app.get('/', function(req, res){
  res.sendFile(path.join(__dirname, 'index.html'));
});

var peopleonline = [];

io.on('connection', function(socket){	

	MongoClient.connect(url, function(err, db) {
	  assert.equal(null, err);
	  getmessages(db, function() {
	      db.close();
	  });
	});

	socket.send(socket.id);

	socket.on('chat message', function(msg){
		io.emit('chat message',{'msg': msg.msg, 'name':msg.name});
		MongoClient.connect(url, function(err, db) {
		  assert.equal(null, err);
		  insertmessage(db,msg.name,msg.msg, function() {
		      db.close();
		  });
		});
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




var insertmessage = function(db,name,msg, callback) {
   db.collection('chat').insertOne( {
      name:name, msg:msg, time: new Date()
   }, function(err, result) {
    assert.equal(err, null);
    console.log("Inserted a document into the restaurants collection.");
    callback();
  });
};

var getmessages = function(db, callback) {
   var messages = [];
   var cursor =db.collection('chat').find();
   cursor.each(function(err, doc) {
      assert.equal(err, null);
      if (doc != null) {
         messages.push([doc.name, doc.msg]);
      } else {
   		 io.emit('old messages',messages);
         callback();
      }
   });
};


http.listen(3000, function(){
  console.log('listening on *:3000');
});