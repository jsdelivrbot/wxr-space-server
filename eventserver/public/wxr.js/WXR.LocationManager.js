'use strict';

class WXRLocationManager {
	constructor() {
		this.beacons = [];
		this.timers = [];
	}

	init() {
		if (WXR.ContextManager.getWXRDeviceType() === WXRDevice.MOBILE) {
			let appearId = WXR.Sensor.addEventListener('appear', [], this.appearBeacons.bind(this));
			let disappearId = WXR.Sensor.addEventListener('disappear', [], this.disappearBeacons.bind(this));

			this.getCurrentBeacons((beacons, err) => {
				if (err) {
					WXR.log(WXRLocationManager.TAG, err);
					return;
				}

				WXR.log(WXRLocationManager.TAG, "init Beacons: " + beacons);

				for (let beacon of beacons) {
					if (this.beacons.indexOf(beacon) === -1) {
						this.beacons.push(beacon);
						WXREvent.dispatchEvent({type: WXREvent.BEACON_DETECTED, beacon: beacon});
					}
				}
			});
		}
	}

	getCurrentBeacons(callback) {
		WXR.Sensor.getCurrentBeacons((beacons, err) => {

			WXR.log(WXRLocationManager.TAG, "current beacons: " + beacons);

			callback(beacons, err);
		});
	}

	watchBeacons(callback, sec) {
		let timerId = setInterval(() => {
			WXR.Sensor.getCurrentBeacons((beacons, err) => {
				if (err) {
					WXR.log(WXRLocationManager.TAG, err);
					return;
				}

				WXR.log(WXRLocationManager.TAG, "get beacons: " + beacons);

				for (let beacon of beacons) {
					callback(beacon, timerId);
				}
			});
		}, sec);

		this.timers.push(timerId);
	}

	appearBeacons(beacons, err) {
		if (err) {
			WXR.log(WXRLocationManager.TAG, err);
			return;
		}

		WXR.log(WXRLocationManager.TAG, "appear: " + beacons);

		for (let beacon of beacons) {
			if (this.beacons.indexOf(beacon) === -1) {
				this.beacons.push(beacon);
				WXREvent.dispatchEvent({type: WXREvent.BEACON_DETECTED, beacon: beacon});
			} else {
				WXR.log(WXRLocationManager.TAG, "beacons have " + beacon);
			}
		}
	}

	disappearBeacons(beacons, err) {
		if (err) {
			WXR.log(WXRLocationManager.TAG, err);
			return;
		}

		WXR.log(WXRLocationManager.TAG, "disappear: " + beacons);

		for (let beacon of beacons) {
			let index = this.beacons.indexOf(beacon);

			if (index !== -1) {
				WXREvent.dispatchEvent({type: WXREvent.BEACON_MISSED, beacon: beacon});
				this.beacons.splice(index, 1);
			}
		}
	}

	removeWatch(timerId) {
		let index = this.timers.indexOf(timerId);

		if (index !== -1) {
			clearInterval(timerId);
			this.timers.splice(index, index - 1);
		}
	}
}

WXRLocationManager.TAG = "WXRLocationManager";

module.exports = WXRLocationManager;
