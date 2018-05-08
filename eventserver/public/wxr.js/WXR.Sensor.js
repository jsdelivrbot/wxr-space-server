'use strict';

class WXRSensor {
	constructor() {
		this.callback = {};
	}

	generateUUID() {
		let UUID = THREE.Math.generateUUID();

		return UUID;
	}

	getCurrentBeacons(callback, options) {
		let callbackId = this.generateUUID();

		// store callback function.
		this.callback[callbackId] = (...args) => {
			// parse string as array of beacons list.
			args[0] = args[0].slice(1, -1).split(', ');
			args[1] = args[1] === "null" ? null : args[1];

			// Function.prototype.apply(thisArg, [argsArray])
			callback.apply(null, args);

			// delete callback function
			delete this.callback[callbackId];
		}

		// callbackId has to be String.
		WXR.SensorManager.getCurrentBeacons(callbackId, null);

		return;
	}

	// EventType: watch, appear, disappear
	addEventListener(eventName, listenerTarget, callback, options) {
		listenerTarget = listenerTarget || [];
		options = options || {};

		// eventListenerId is exactly same with callbackId, but this division is needed for semantics.
		let callbackId = this.generateUUID();
		let eventListenerId = callbackId;

		// store callback function.
		this.callback[callbackId] = (...args) => {
			// parse string as array of beacons list.
			args[0] = args[0].slice(1, -1).split(', ');
			args[1] = args[1] === "null" ? null : args[1];

			// Function.prototype.apply(thisArg, [argsArray])
			callback.apply(null, args);
		}

		WXR.SensorManager.addEventListener(eventName, JSON.stringify(listenerTarget), callbackId, JSON.stringify(options));

		return eventListenerId;
	}

	removeEventListener(eventListenerId) {
		WXR.SensorManager.removeEventListener(eventListenerId);

		// delete callback function
		let callbackId = eventListenerId;
		delete this.callback[callbackId];


		return;
	}
}

module.exports = WXRSensor;
