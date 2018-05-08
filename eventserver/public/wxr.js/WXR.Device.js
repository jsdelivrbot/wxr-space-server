'use strict';

class WXRDevice {
	mobileInfo(dpdb) {
		let userAgent = navigator.userAgent || navigator.vendor || window.opera;
		
		// webVR의 Util.getScreenWidth, getScreenHeight
		let width = Math.max(window.screen.width, window.screen.height) * window.devicePixelRatio;
		let height = Math.min(window.screen.width, window.screen.height) * window.devicePixelRatio;
		
		for (let i = 0; i < dpdb.devices.length; i++) {
			let device = dpdb.devices[i];
			
			if (!device.rules) {
				console.warn('Device[' + i + '] has no rules section.');
				continue;
			}
			
			if ( (device.type !== WXRDevice.IOS) && (device.type !== WXRDevice.ANDROID) ) {
				console.warn('Device[' + i + '] has invalid type.');
				continue;
			}
			
			let matched = false;
			
			for (let j = 0; j < device.rules.length; j++) {
				let rule = device.rules[j];
				if (this.matchRule_(rule, userAgent, width, height)) {
					matched = true;
					break;
				}
			}
			
			if (!matched) {
				continue;
			}
			
			return device;
		}
	}
	
	matchRule_(rule, ua, screenWidth, screenHeight) {
		if (!rule.ua && !rule.res) return false;
		
		// If our user agent string doesn't contain the indicated user agent string,
		// the match fails.
		if (rule.ua && ua.indexOf(rule.ua) < 0) return false;
		
		// If the rule specifies screen dimensions that don't correspond to ours,
		// the match fails.
		if (rule.res) {
			if (!rule.res[0] || !rule.res[1]) return false;
			let resX = rule.res[0];
			let resY = rule.res[1];
			// Compare min and max so as to make the order not matter, i.e., it should
			// be true that 640x480 == 480x640.
			if (Math.min(screenWidth, screenHeight) != Math.min(resX, resY) ||
				(Math.max(screenWidth, screenHeight) != Math.max(resX, resY))) {
				return false;
			}
		}
		
		return true;
	}
	
	getMobileDeviceProfile(callback) {
		let ONLINE_DPDB_URL = 'https://dpdb.webvr.rocks/dpdb.json';
		let that = this;
		
		$.ajax({
			url: ONLINE_DPDB_URL,
			success: function (dpdb) {
				callback(that.mobileInfo(dpdb));
			}
		});
	}
	
	getDesktopDeviceProfile(callback) {
		callback();
	}
}

WXRDevice.AR = "AR";
WXRDevice.VR = "VR";
WXRDevice.MODE3D = "3D";
WXRDevice.MOBILE = "mobile";
WXRDevice.DESKTOP = "desktop";
WXRDevice.IOS = "ios";
WXRDevice.ANDROID = "android";

module.exports = WXRDevice;
