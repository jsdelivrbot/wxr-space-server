


module.exports = function(http) {
	
	var io = require('socket.io')(http);

	
	io.on('connection', function(socket){
		console.log('a user connected');

		// device_uuid variable
		let server_name = '';

		socket.on('vrpn_event', function(msg) {

			if (!msg || !msg.event || !msg.detail) {
				console.error(`invalid msg!`);
				return ;
			}

			// Q: If timestamp is invalid, throw away it? Or create new one in event server?
			// A message that has invalid timestamp will be dropped.
			let timestamp = msg.detail.timestamp;
			if (!timestamp) {
				return;
			}

			switch (msg.event) {
				case 'optitrack_server_on':
					server_name = msg.detail.server_name || 'noname';

					if (!!global.DEVICES.find( e => e['Server name'] === server_name ) === false) {
						// make device profile
						const deviceProfile = {
							'Server name'     : server_name,
							'Server state'    : 'on',
						}
						global.DEVICES.push(deviceProfile);
					}

					break;
				case 'optitrack_tracking_start':

					break;
				case 'optitrack_tracking_6dof':

					break;
				case 'optitrack_tracking_end':

					break;
			}

			console.log(msg);
		});

		socket.on('disconnect', function() {
			/*
			 * save optitrack_server_off event manually in event server
			 * due to detecting websocket disconnected is only possible by event server
			 *
			 * < message structure >
			 * { event: 'optitrack_server_off',
			 *	 detail: {
			 *		 timestamp: timestamp,
			 *		 server_name: 'dummy_server' } }
			 */

			let msg = {
				event: 'optitrack_server_off',
				detail: {
					timestamp: Date.now()
				}
			}


			global.DEVICES.find( e => e['Server name'] === server_name )['Server state'] = 'off';

			console.log('user is disconnected');
		});



	});
	
	return io;
}
