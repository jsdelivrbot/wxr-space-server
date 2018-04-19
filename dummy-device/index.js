var socket = require('socket.io-client')('http://localhost:6712');

var is_first_message = true;
var global_i = 0;

				
socket.on('connect', function(){
	console.log('socket.io is connected!');
	
		/*
		 * "optitrack_server_on" event
		 * 
		 * {
		 *     "event": "optitrack_server_on",
		 *     "detail": {
		 *         "timestamp": time
		 *         "server_name": server_name
		 *     }
		 * }
		 *
		 */
	deviceInformation = {
		device: 'Optitrack',
		name: 'MyOptitrack',
		connectionType: 'VRPN'
	}
	socket.emit('WXRDeviceInit', deviceInformation);
	
	
	(function timer(t_time) {
		setTimeout(function() {
			send_dof();
			if (++global_i < 10)
				timer(100);
			else {
				tracking_end();
				setTimeout(function() { process.exit() }, 1000);
			}
		}, t_time);
	})();

	
});

function send_dof() {
	
	if (is_first_message == true) {
		is_first_message = false;
		
		const msg = {
			event: 'trackerDetected',
			timestamp: Date.now(),
			detail: { }
		}
		socket.emit('WXREvent', msg);
	}
	
	const msg = {
		event: 'trackerMoved',
		timestamp: Date.now(),
		detail: {
			pos: [0.1, 0.2, 0.3],
			quat: [0.01, 0.02, 0.03, 0.04]
		}
	}
	socket.emit('WXREvent', msg);
}

function tracking_end() {

	const msg = {
		event: 'trackerMissed',
		timestamp: Date.now(),
		detail: { }
	}
	socket.emit('WXREvent', msg);
	is_first_message = true;
}