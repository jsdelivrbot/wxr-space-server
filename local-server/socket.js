


module.exports = function(http) {
	
	var io = require('socket.io')(http);
	const ioClient = require('socket.io-client');

	const messageQ = [];
	const lcoalServerName = 'dummy_server';


	/*
	 * logic for communicating with event server.
	 */
	function connectWebsocketToEventServer() {
		const websocketAccessURL = `${global.REMOTE_ORIGIN}:${global.WEBSOCKET_ACCESS_PORT}`;   // This will be 192.168.1.x:6711
		ioForEventServer = ioClient(websocketAccessURL, {
			transportOptions: {
				polling: {
					extraHeaders: {
						'Cookie': createJSONOptions.cookie
					}
				}
			}
		});
		ioForEventServer.on('error', function(message) {
			console.log(`error: ${message}`);
		});

		// send 'local_server_on' event
		const serverOnMessage = {
			event: 'local_server_on',
			detail: {
				serverName: lcoalServerName,
				timestamp: Date.now()
			}
		}
		console.log('send local_server_on');
		ioForEventServer.emit('vrpn_event', serverOnMessage);

		// send 'packagedMessage' event periodically in every 100 milliseconds.
		const packagedMessage = {
			event: 'local_packaged_events',
			detail: {}
		}
		setInterval( () => {

			// send message only if there are messages.
			if (messageQ.length < 1) {
				return;
			}

			packagedMessage.detail.timestamp = Date.now();
			packagedMessage.detail.messages = messageQ;
			console.log('send local_packaged_events');
			ioForEventServer.emit('vrpn_event', packagedMessage);

			// flush messageQ
			messageQ.length = 0;
		}, 100);
		ioForEventServer.on('vrpn_event', function(message) {
			io.local.emit('vrpn_event', message);
		});
		ioForEventServer.on('enter_workspace_response', message => console.log(`entering workspace reponse: ${message}`));
	}

	// trying to connect to event server after createJSONOptions.cookie value is set.
	(function tryingToConnect() {
		if (!!createJSONOptions.cookie === true) {
			connectWebsocketToEventServer();
		} else {
			setTimeout(tryingToConnect, 1000);
		}
	})();




	/*
	 * logic for communicating with browser client or devices.
	 */
	io.on('connection', function(socket){


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

				case 'optitrack_tracking_start':
				case 'optitrack_tracking_6dof':
				case 'optitrack_tracking_end':

					messageQ.push(msg);

					break;

				// when connected by browser.
				default:

					// do nothing.
					break;
			}

		});

		socket.on('disconnect', function() {
			/*
			 * invoke optitrack_server_off event manually in local server
			 * due to detecting websocket disconnected is only possible by local server
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

			// only if the socket is connected by device channel, shut off device status.
			const device = global.DEVICES.find( e => e['Server name'] === server_name );
			if (!!device === true) {
				device['Server state'] = 'off';

				messageQ.push(msg);
			}

		});



	});
	
	return io;
}
