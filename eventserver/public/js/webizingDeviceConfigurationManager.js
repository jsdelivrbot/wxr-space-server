// webizingDeviceConfigurationManager.js

webizingDeviceConfigurationManager = new function() {

	const SERVER_URL = 'http://localhost:6701';
	const WEBIZING_DEVICE_MANAGER_URI = 'http://localhost:6712';
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
	});

	socket.on('error', function(err) {
		Log(`error: `, err);
	});


	// Get DeviceProfiles from server
	$.ajax(SERVER_URL + `/user/me/device`)
		.done( data => {
			if (data.status === 'ok') {
				DeviceProfiles = data.message.profiles;
				socket.emit('WXRUpdateDeviceProfiles', DeviceProfiles);
			}
		});


	this.getDeviceProfiles = function SyncProfilesWithServer() {
		Log(`getDeviceProfiles function.`);
		return Object.assign([], DeviceProfiles);
	};

	this.createProfile = function(device, name, callback) {
		callback = callback || new Function();
		Log(`createProfile function.`);

		// If there is profile matching with device and name...
		let profile = null;
		if ((!!device && !!name) === true && (profile = DeviceProfiles.find( p => p.device === device && p.name === name ))) {
			Log(`POST profile`);
			$.ajax({
				type: 'POST',
				url: SERVER_URL + `/user/me/device`,
				data: profile,
			})
				.done( data => {
					Log(`Receive POST profile response: `, data);
					if (data.status === 'ok') {
						const index = DeviceProfiles.findIndex( p => p.device === device && p.name === name );
						DeviceProfiles[index] = data.message.profile;
						socket.emit('WXRUpdateDeviceProfiles', DeviceProfiles);
					}
					callback(data);
				});
		}
	};

	this.updateProflie = function({id, device, name}, property, value, callback) {
		callback = callback || new Function();
		Log(`updateProfile function.`);

		// Given with device id
		if (!!id === true) {

			Log(`PUT ${property}=${value}`);
			$.ajax({
				type: 'PUT',
				url: SERVER_URL + `/user/me/device/${id}`,
				data: `property=value`,
			})
				.done( data => {
					Log(`Receive PUT ${property}=${value} response: `, data);
					if (data.status === 'ok') {
						const index = DeviceProfiles.findIndex( p => p.id === id );
						if (index !== -1) {
							DeviceProfiles[index] = data.message.profile;
							socket.emit('WXRUpdateDeviceProfiles', DeviceProfiles);
						}
					}
					callback(data);
				});

		} else if ((!!device && !!name) === true && DeviceProfiles.find( p => p.device === device && p.name === name )) {
			// Given with device model name and its name, that is unregistered.

			Log(`Set unregistered device profile property.`);
			const profile = DeviceProfiles.find( p => p.device === device && p.name === name );
			profile[property] = value;
			socket.emit('WXRUpdateDeviceProfiles', DeviceProfiles);
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
				url: SERVER_URL + `/user/me/device/${id}`,
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

	function Log(...argv) {
		console.log('webizingDeviceConfigurationManager: ', ...argv);
	}
};