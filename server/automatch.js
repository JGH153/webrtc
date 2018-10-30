/* TODO switch to 

const express = require('express');
const SocketServer = require('ws').Server;
const path = require('path');

const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, 'index.html');

const server = express()
  .use((req, res) => res.sendFile(INDEX) )
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));

const wss = new SocketServer({ server });


dependecies:

    "bufferutil": "1.2.1",
    "express": "4.13.4",
    "utf-8-validate": "1.2.1",
		"ws": "^3.2.0"

*/









//require our websocket library
const WebSocketServer = require('ws').Server;

//creating a websocket server at port 9065
const wss = new WebSocketServer({ port: 9065 });

//all connected to the server users
var users = {};

let lastUserId = 0;
let availableUser = null;

/*
Flow:

User A connects
User A is assigned ID 10 (gudi/rand?/icrement?)
Server says no match is ready to A
User A goes into loading

User B connects
User B is assigned ID 20
Server says a match is present to B (id of A)

User B creates offer and send via server to A
A sends accept to B via server
ICE is relayed between the two
Connected!
*/

wss.on('connection', onConnection);

function onConnection(connection) {
	
	connection.on('message', function (message) {
		onMessage(connection, message);
	}
	);
	connection.on("close", function () {
		onConnectionClose(connection);
	});

	const currentUserId = lastUserId++;
	users[currentUserId] = connection;
	connection.myUserId = currentUserId; // TODO config object?
	connection.otherUserId = null;

	// send match if present, or none if waiting
	if (availableUser === null) {
		console.log('connected! no match');
		sendTo(connection, {
			type: "match",
			yourUserId: currentUserId,
			matchId: null
		});
		availableUser = currentUserId;
	} else {
		console.log('connected! match!');
		sendTo(connection, {
			type: "match",
			yourUserId: currentUserId,
			matchId: availableUser
		});
		availableUser = null;
	}
}

function onMessage(connection, message) {
	let data;
	//accepting only JSON messages
	try {
		data = JSON.parse(message);
	} catch (e) {
		console.log("Invalid JSON");
		data = {};
	}

	//switching type of the user message
	switch (data.type) {
		case "offer":
		//for ex. UserA wants to call UserB
		console.log("Sending offer to: ", data.name);

		//if UserB exists then send him offer details
		var conn = users[data.name];

		if (conn != null) {
			//setting that UserA connected with UserB
			connection.otherUserId = data.name;

			sendTo(conn, {
				type: "offer",
				offer: data.offer,
				name: connection.myUserId
			});
		}

		break;

	case "answer":
		console.log("Sending answer to: ", data.name);
		//for ex. UserB answers UserA
		var conn = users[data.name];

		if (conn != null) {
			connection.otherUserId = data.name;
			sendTo(conn, {
				type: "answer",
				answer: data.answer
			});
		}

		break;

	case "candidate":
		console.log("Sending candidate to:", data.name);
		var conn = users[data.name];

		if (conn != null) {
			sendTo(conn, {
				type: "candidate",
				candidate: data.candidate
			});
		}

		break;

	case "leave":
		console.log("Disconnecting from", data.name);
		var conn = users[data.name];
		conn.otherUserId = null;

		//notify the other user so he can disconnect his peer connection
		if (conn != null) {
			sendTo(conn, {
				type: "leave"
			});
		}

		break;

	default:
		sendTo(connection, {
			type: "error",
			message: "Command not found: " + data.type
		});

		break;
	}

}

function onConnectionClose(connection) {
	delete users[connection.myUserId];

	if (availableUser === connection.myUserId) {
		console.log('removing as waiting match');
		availableUser = null;
	}

	if (connection.otherUserId) {
		console.log("Disconnecting from ", connection.otherUserId);
		var conn = users[connection.otherUserId];

		// TEMP fix
		if (!conn){
			return ;
		}

		conn.otherUserId = null;

		if (conn != null) {
			sendTo(conn, {
				type: "leave"
			});
		}
	}
}

function sendTo(connection, message) {
	connection.send(JSON.stringify(message));
}