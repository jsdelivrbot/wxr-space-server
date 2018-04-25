// webizingDeviceConfigurationManager.js

webizingDeviceConfigurationManager = new function() {

	const SHOW_CONSOLE_LOG = false;
	const SERVER_URL = 'http://localhost:6701';
	const WEBIZING_DEVICE_MANAGER_URI = 'http://localhost:6712';
	const profileUpdateListners = [];
	let DeviceProfiles = [];

	// Socket.io set up
	const socket = io(WEBIZING_DEVICE_MANAGER_URI);
	socket.on('connect', function() {
		Log(`Socket is connected with WebizingDeviceManager`);
		socket.emit('WXRUpdateDeviceProfiles', DeviceProfiles);
	});

	socket.on('WXRUpdateDeviceProfiles', function(profiles) {
		Log(`Get DeviceProfiles: `, profiles);
		DeviceProfiles = profiles;
		profileUpdateListners.forEach( listener => listener(profiles) );
	});

	socket.on('error', function(err) {
		Log(`error: `, err);
	});


	// Get DeviceProfiles from server
	$.ajax(SERVER_URL + `/users/me/devices`)
		.done( data => {
			if (data.status === 'ok') {
				DeviceProfiles = data.message;
				socket.emit('WXRUpdateDeviceProfiles', DeviceProfiles);
			}
		});

	this.addUpdateListener = function (f) {
		profileUpdateListners.push(f);
	};

	this.getDeviceProfiles = function() {
		return [].concat(DeviceProfiles);
	};

	this.createProfile = function(profile, callback) {
		callback = callback || new Function();
		Log(`createProfile function.`);

		// If there is profile matching with device and name...
		if (findIndexInDeviceProfiles(profile) >= 0) {
			Log(`POST profile`);
			$.ajax({
				type: 'POST',
				url: SERVER_URL + `/devices`,
				data: profile,
			})
				.done( data => {
					Log(`Receive POST profile response: `, data);

					if (data.status === 'ok') {
						const index = findIndexInDeviceProfiles(profile);
						DeviceProfiles[index] = data.message;
					}

					socket.emit('WXRUpdateDeviceProfiles', DeviceProfiles);
					callback(data);
				});
		}
	};

	this.updateProfile = function(id, profile, callback) {
		callback = callback || new Function();
		Log(`updateProfile function.`);

		// Given with device id
		if (!!id === true) {

			Log(`PUT `, profile);
			$.ajax({
				type: 'PUT',
				url: SERVER_URL + `/devices/${id}`,
				data: profile,
			})
				.done(data => {
					Log(`Receive PUT `, profile, `response: `, data);
					if (data.status === 'ok') {
						const index = DeviceProfiles.findIndex(p => p.id === id);
						DeviceProfiles[index] = data.message;
					}
					socket.emit('WXRUpdateDeviceProfiles', DeviceProfiles);
					callback(data);
				});
		}
	};

	this.deleteProfile = function(id, callback) {
		callback = callback || new Function();
		Log(`deleteProfile function.`);

		// If there is profile matching with device and name...
		if (!!id === true) {
			Log(`DELETE profile`);
			$.ajax({
				type: 'DELETE',
				url: SERVER_URL + `/devices/${id}`,
			})
				.done(data => {
					Log(`Receive DELETE profile response: `, data);
					if (data.status === 'ok') {
						const index = DeviceProfiles.findIndex(p => p.id === id);
						if (index !== -1) {
							DeviceProfiles.splice(index, 1);
							socket.emit('WXRUpdateDeviceProfiles', DeviceProfiles);
						}
					}
					callback(data);
				});
		}
	};


	function Log(...args) {
		if (!SHOW_CONSOLE_LOG) return;
		console.trace('webizingDeviceConfigurationManager: ', ...args);
	}

	function findIndexInDeviceProfiles(profile) {
		if (!profile.device || !profile.name) return -2;
		return DeviceProfiles.findIndex( p => p.device === profile.device && p.name === profile.name );
	}
};



EventHandler = new function() {

	const SERVER_EVENT_ROUTER_URI = 'http://localhost:6711';
	const WEBIZING_DEVICE_MANAGER_URI = 'http://localhost:6712';

	// eventRouterSocket
	const eventRouterSocket = io(SERVER_EVENT_ROUTER_URI);
	eventRouterSocket.on('connect', function() {
		console.log('eventRouterSocket connection.');
	});
	eventRouterSocket.on('WXREvent', function(event) {

		eventHandlers.forEach( handler => handler(event) );
	});


	// deviceManagerSocket
	const eventHandlers = [];
	const deviceManagerSocket = io(WEBIZING_DEVICE_MANAGER_URI);
	deviceManagerSocket.on('connect', function() {
		console.log('deviceManagerSocket connection.');
	});
	deviceManagerSocket.on('WXREvent', function(event) {
		eventHandlers.forEach( handler => handler(event) );

		if (event.id !== 'device no id') {
			const deviceProfile = webizingDeviceConfigurationManager.getDeviceProfiles().find( p => p.id === event.id );
			if (!deviceProfile.isNoBroadcast && eventRouterSocket) {
				eventRouterSocket.emit('WXREvent', event);
			}
		}
	});


	this.addHandler = function(h) {
		eventHandlers.push(h);
	};

};