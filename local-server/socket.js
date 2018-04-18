

const PORT = 6712;
var io = require('socket.io')(PORT);


// variables
let clientSocket = null;
let DeviceProfiles = [];
const LiveDeviceList = [];

// constants
const DEVICE_NO_ID = 'device no id';
const DEVICE_NO_NAME = 'noname';
const DEVICE_NO_DEVICE = 'unknown device';
const DEVICE_NO_CONNECTION_TYPE = 'unknown connection type';
const DEVICE_NO_EVENT_TYPE = [];
const EVENT_TYPE = {
	'Tracker': [],
	'Button': [],
	'HandGesture': [],
};

const DEVICE_STATUS_OFF = 'disconnected';
const DEVICE_STATUS_ON = 'connected';
const DEVICE_STREAM_ON = true;
const DEVICE_STREAM_OFF = false;



io.on('connection', function(socket) {


	/*
	 * Device control processes are here...
	 */
	// Initialize device socket.
	socket.on('WXRDeviceInit', function(deviceInformation) {

		// This event only once evoked at device initial time.
		// For this, check LiveDeviceList.
		if (LiveDeviceList.includes(socket) === true) {
			HandleError(`This device is already initialized.`);
			return;
		}

		// Get device profile.
		// First, create basic profile temporarily.
		let profile = CreateDeviceProfile(deviceInformation);

		// Then, check device name collision in LiveDeviceList.
		const collisionExist = LiveDeviceList.find( socket => socket.data.profile.device === profile.device
																														&& socket.data.profile.name === profile.name );
		if (collisionExist) {
			HandleError(`There is device name collision.`);
			return;
		}

		// Finally, search device profile in DeviceProfiles and save it at socket.data.profile
		socket.data.profile = DeviceProfiles.find( p => p.device === profile.device && p.name === profile.name )
														|| profile;   // if there isn't, use default profile.


		// Store socket in LiveDeviceList
		LiveDeviceList.push(socket);

		// If profile is basic one, store profile in DeviceProfiles
		if (DeviceProfiles.includes(socket.data.profile) === false) DeviceProfiles.push(socket.data.profile);

		// Update DeviceProfiles.
		if (clientSocket) {
			clientSocket.emit('WXRUpdateDeviceProfiles', DeviceProfiles);
		}
	});


	// Stream event data from device.
	socket.on('WXREvent', function(msg) {

		// Check if client is on and if this device event stream is disabled.
		if (!clientSocket || !socket.data || !socket.data.profile.eventStreamEnable) return;

		// Check message structure is valid.
		if (!msg || !msg.event || !msg.detail) {
			HandleError(`invalid msg!: ${msg}`);
			return ;
		}

		msg.timestamp = msg.timestamp || Date.now();

		// Send msg to client
		clientSocket.emit('WXREvent', msg);
	});


	// When the device is shut off.
	socket.on('disconnect', function() {

		// Check if client is on and socket is of device.
		if (clientSocket && socket.data && socket.data.profile) {

			// Send device is shut off message.
			if (socket.data.profile.eventStreamEnable) {
				const DeviceIsShutOffMessage = {
					id: socket.data.profile.id,
					event: 'WXRDeviceOff',
					timestamp: Date.now(),
					detail: { }
				};

				clientSocket.emit('WXREvent', DeviceIsShutOffMessage);
			}

			// Update device profile.
			socket.data.profile.status = DEVICE_STATUS_OFF;
			clientSocket.emit('WXRUpdateDeviceProfiles', DeviceProfiles);
		}

		// Removes socket in LiveDeviceList.
		let indexOfSocket = LiveDeviceList.indexOf(socket);
		LiveDeviceList.splice(indexOfSocket, 1);
	});



	/*
	 * Client instruction processes are here...
	 */
	// Update DeviceProfiles
	socket.on('WXRUpdateDeviceProfiles', (profiles) => {
		clientSocket = socket;
		DeviceProfiles = profiles;
		UpdateSocketAndProfileBinding();

		// Send back updated device profiles.
		clientSocket.emit('WXRUpdateDeviceProfiles', DeviceProfiles);
	});


	/*
	 * Helper functions...
	 */

	function HandleError(msg) {
		console.error(msg);
		socket.emit('error', new Error(msg));
	}

	function UpdateSocketAndProfileBinding() {

		DeviceProfiles.forEach( profile => {

			const deviceSocket = LiveDeviceList.find( socket => {
				if (profile.id !== DEVICE_NO_ID && socket.data.profile.id === profile.id) return true; // Check if the socket is prelinked.
				else if (socket.data.profile.device === profile.device && socket.data.profile.name === profile.name) return true; // Check if name and device property are same for unregistered device at server.
			});

			if (deviceSocket) {
				deviceSocket.data.profile = profile;
			} else {
				profile.status = DEVICE_STATUS_OFF;
			}
		});

		LiveDeviceList.forEach( socket => {
			if (DeviceProfiles.includes(socket.data.profile) === false) {
				DeviceProfiles.push(socket.data.profile);
			}
		});

		NonameGenerator.reset();
	}

	function CreateDeviceProfile(deviceInformation) {
		const profile = {};
		profile.id = DEVICE_NO_ID;
		profile.device = deviceInformation.device || DEVICE_NO_DEVICE;
		profile.name = deviceInformation.name || NonameGenerator.next(profile.device); // Generate device name with no collision.
		profile.connectionType = deviceInformation.connectionType || DEVICE_NO_CONNECTION_TYPE;
		profile.eventType = EVENT_TYPE[profile.connectionType] || DEVICE_NO_EVENT_TYPE;
		profile.status = DEVICE_STATUS_ON;
		profile.eventStreamEnable = DEVICE_STREAM_ON;
		return profile;
	}
});


// Generate noname device as number sequence.
const NonameGenerator = new function() {
	const NUMBER_LENGTH = 2;
	let pool = [];

	this.next = function(device) {
		if (pool[device] === undefined) pool[device] = [];
		const dp = pool[device];

		let i=0;
		for ( ; i < dp.length+1; ++i) {
			if (dp[i] === undefined) break;
		}

		const name = DEVICE_NO_NAME + getFixedLengthString(i);
		dp[i] = name;
		dp[name] = i;
		return name;
	};

	this.reset = function() {
		pool = [];

		DeviceProfiles.forEach( profile => {
			let {name, device} = profile;

			if (isValidNonameString(name) === false)
				return;

			const i = parseInt(name.subString(DEVICE_NO_NAME.length));
			pool[device][i] = name;
			pool[device][name] = i;
		});
	};

	function getFixedLengthString(number) {
		let n = number.toString();
		while (n.length < NUMBER_LENGTH) {
			n = '0' + n;
		}
		return n;
	}

	function isValidNonameString(name) {
		return name.length === DEVICE_NO_NAME.length + NUMBER_LENGTH
						&& name.startsWith(DEVICE_NO_NAME) === true
						&& Number.isInteger(parseInt(name.subString(DEVICE_NO_NAME.length))) === true
	}
};