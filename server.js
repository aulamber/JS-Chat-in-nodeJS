var http = require('http');
var fs = require('fs');

//Loads client side file
var server = http.createServer(function(req, res) {
    fs.readFile('./index.html', 'utf-8', function(error, content) {
        res.writeHead(200, {"Content-Type": "text/html",
        		"Access-Control-Allow-Origin": true});
        res.end(content);
    });
});

// attach socket.io to http server
var io = require('socket.io').listen(server);


io.sockets.on('connection', function (socket, name) {
	socket.on("addUser", function (name) {
		// sets session's username
		socket.client.name = name;
		// tells other users that someone joined
		socket.broadcast.emit("userConnection", name);
		//debug
		console.log(name + ' joined');
	});

	// when someone sends a message, send to others and send back a confirmation
	socket.on('messageFromClient', function (message) {
		var date = new Date();
		messageFull = {
			content : message,
			name : socket.client.name,
			date : date.toUTCString(),

		}
		// send message to others
		socket.broadcast.emit("messageFromServer", messageFull);
		// message transmission confirmation sent back to the sender
		socket.emit("messageConfirm", messageFull);
		//debug
		console.log(messageFull);
	});

	// if someone leaves, tell everyone
	socket.on('removeUser', function () {
		socket.broadcast.emit('userDisconnection', socket.client.name);
	});
});


// start the server
server.listen(8080);