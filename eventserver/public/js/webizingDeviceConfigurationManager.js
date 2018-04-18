// webizingDeviceConfigurationManager.js

;(function () {

	const WEBIZING_DEVICE_MANAGER_PORT = 6712;

	const socket = io('http://localhost:' + WEBIZING_DEVICE_MANAGER_PORT);
	socket.on('connect', function(data) {
		console.log(`connected: `, data);
	});
	socket.on('WXRUpdateDeviceProfiles', function(data) {
		console.log(`DeviceProfiles: `, data);
	});
	socket.on('error', function(data) {
		console.log(`error: `, data);
	});

	window.socket = socket;
}());