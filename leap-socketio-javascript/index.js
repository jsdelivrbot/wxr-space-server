var W3CWebSocket = require('websocket').w3cwebsocket;
var socketio = require('socket.io-client')('http://localhost:6712');

 
var leapClient = new W3CWebSocket('ws://localhost:6437/v6.json');


var is_first_message = false;



 
leapClient.onerror = function() {
    console.log('Connection Error');
};
 
leapClient.onopen = function() {
    console.log('WebSocket Client Connected');
	var enableMessage = JSON.stringify({enableGestures: true});
	leapClient.send(enableMessage); // Enable gestures
	var backgroundMessage = JSON.stringify({background: true});
	leapClient.send(backgroundMessage); // Get frames in background

};
 
leapClient.onclose = function() {
    console.log('echo-protocol Client Closed');
};
 
leapClient.onmessage = function(e) {
	var frame = JSON.parse(e.data);
	
	
	if (frame.hands && frame.hands.length > 0) {
		if (is_first_message == true) {
			is_first_message = false;
		
			const msg = {
				type: 'HandGestureDetected',
				timestamp: Date.now(),
				detail: { }
			}
			socketio.emit('WXREvent', msg);
		}
	
		const msg = {
			type: 'HandGestureMoved',
			timestamp: Date.now(),
			detail: {
				pos: frame.t,
				quat: [],	// frame.r
				frame: frame
			}
		}
		socketio.emit('WXREvent', msg);
		
	} else if (is_first_message == false) {
		tracking_end();
	}
};
 
 
socketio.on('connect', function(){
	console.log('socketio connection.');
	deviceInformation = {
		device: 'LeapMotion',
		name: 'MyLeap',
		connectionType: 'WebSocket'
	}
	socketio.emit('WXRDeviceInit', deviceInformation);	
	
});

socketio.on('error', function(err) {
	console.log(err);
});


function tracking_end() {

	const msg = {
		type: 'HandGestureMissed',
		timestamp: Date.now(),
		detail: { }
	}
	socketio.emit('WXREvent', msg);
	is_first_message = true;
}
 
 