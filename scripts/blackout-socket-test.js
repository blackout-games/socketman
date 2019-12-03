const socketUrl = 'https://io.blackoutrugby.com:8080/';
var socket = OpenSocket(socketUrl);

function ReopenSocket() {
	socket = OpenSocket(socketUrl);
}

function _CloseSocket() {
	CloseSocket(socket);
}

function SetDefaultHeaders() {
	var token = document.getElementById('tokenInput').value;
	var headers = GetCommonHeaders(socket, token);

	document.getElementById('requestHeader').value = JSON.stringify(headers, undefined, 4);
}

function SendWithMethod(method) {
	var path = document.getElementById('requestPath').value;
	var query = document.getElementById('requestQuery').value;
	var headers = document.getElementById('requestHeader').value;
	try {
		headers = JSON.parse(headers);
	} catch (e) {
		headers = '';
	}
	var body = document.getElementById('requestBody').value;
	try {
		body = JSON.parse(body);
	} catch (e) {
		body = '';
	}
	var payload = GeneratePayload(method, path, query, headers, body);

	SendPayload(socket, payload);
}

function SendGet() {
	SendWithMethod('get');
}

function SendPost() {
	SendWithMethod('post');
}

function SendPatch() {
	SendWithMethod('patch');
}

function SendDelete() {
	SendWithMethod('delete');
}

function OpenSocket(socketUrl) {
	// open a socket, and return it.
	console.log('Opening Socket');

	let options = {
		autoConnect: false,
		secure: true,
		reconnectionAttempts: 10,
		timeout: 15000,        // 15 seconds
		rejectUnauthorized: false      // ignore authorization, we are only using sockets internally
	};

	//manager = new io.Manager(socketUrl, options);

	let socket = io(socketUrl, options);

	//manager.open();
	socket.open();

	socket.on('error', function (error) {
		console.log('oops! something is wrong');
		console.log(error);
	});

	socket.on('connect', function () {
		console.log('Socket connected!');
	});

	socket.on('disconnect', function () {
		console.log('Socket disconnected');
	});

	return socket;
}

function CloseSocket(socket) {
	socket.close();
}

function GetSocketId(socket) {
	return socket.id;
}


function guid() { // Public Domain/MIT
	var d = new Date().getTime();
	if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
		d += performance.now(); //use high-precision timer if available
	}
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		var r = (d + Math.random() * 16) % 16 | 0;
		d = Math.floor(d / 16);
		return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
	});
}

function GeneratePayload(method, path, query, headers, body) {
	var payload = {
		'requestId': guid(),
		'method': method,
		'path': path,
		'queryString': query,
		'headers': headers,
		'body': body
	};

	return payload;
}

function SendPayload(socket, payload) {
	socket.emit('api', payload, function (data) {
		ResponseCallback(data);
	});
}

function GetCommonHeaders(socket, token = '') {
	var json = {
		'Content-Type': 'application/vnd.api+json',
		'Accept-Language': 'en',
		'Socket-ID': GetSocketId(socket),
		//'Blackout-Accept-Encoding': 'base64/gzip',
		'Token': token,
		'Current-Time': new Date()
	};

	return json;
}

function ResponseCallback(response) {
	var status = response['statusCode'];
	var header = response['headers'];
	var body = response['body'];
	var requestId = response['requestId'];

	SetResponseStatus(status, requestId);
	SetResponseHeader(header);
	SetResponseBody(body)
}

function SetResponseStatus(status, requestId) {
	document.getElementById('responseStatus').innerHTML = status;
	document.getElementById('requestIdDisplay').innerHTML = requestId;
}

function SetResponseHeader(header) {
	document.getElementById('responseHeader').value = JSON.stringify(header, undefined, 4);
}

function SetResponseBody(body) {

	var json = JSON.parse(body);

	document.getElementById('responseBody').value = JSON.stringify(json, undefined, 4);
}