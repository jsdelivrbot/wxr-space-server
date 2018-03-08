var socket = require('socket.io-client')('http://localhost:3000');

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
	const msg = {
		event: 'optitrack_server_on',
		detail: {
			timestamp: Date.now(),
			server_name: 'dummy_server'
		}
	}
	socket.emit('vrpn_event', msg);
	
	(function timer1000() {
		setTimeout(function() {
			send_dof();
			if (++global_i < 10)
				timer1000();
			else {
				tracking_end();
				setTimeout(function() { process.exit() }, 1000);
			}
		}, 1000);
	})();

	
});

function send_dof() {
	
	if (is_first_message == true) {
		is_first_message = false;
		
		/*
		 * "optitrack_tracking_start" event
		 *
		 * {
		 *     "event": "optitrack_tracking_start",
		 *     "detail": { 
		 *         "timestamp": timestamp
		 *     }
		 * }
		 *
		 */
		const msg = {
			event: 'optitrack_tracking_start',
			detail: {
				timestamp: Date.now()
			}
		}
		socket.emit('vrpn_event', msg);
	}
	
		/*
	 * "optitrack_tracking_6dof" event
	 *
	 * {
	 *     "event": "optitrack_tracking_6dof",
	 *     "detail": {
	 *         "timestamp": timestamp
	 *         "pos": [p0, p1, p2],
	 *         "quat": [q0, q1, q2, q3]
	 *     }
	 * }
	 *
	 */
	const msg = {
		event: 'optitrack_tracking_6dof',
		detail: {
			timestamp: Date.now(),
			pos: [0.1, 0.2, 0.3],
			quat: [0.01, 0.02, 0.03, 0.04]
		}
	}
	socket.emit('vrpn_event', msg);
}

function tracking_end() {
	/*
	* "optitrack_tracking_end" event
	*
	* {
	*     "event": "optitrack_tracking_end",
	*     "detail": { 
	*         "timestamp": timestamp
	*     }
	* }
	*
	*/
	const msg = {
		event: 'optitrack_tracking_end',
		detail: {
			timestamp: Date.now()
		}
	}
	socket.emit('vrpn_event', msg);
	is_first_message = true;
}