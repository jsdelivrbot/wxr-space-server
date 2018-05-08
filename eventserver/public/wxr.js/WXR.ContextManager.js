'use strict';

class WXRContextManager {
	checkWXRMode() {
		if (this.isMobile()) {
			WXR.Device.getMobileDeviceProfile(function (profile) {
				// console.log(JSON.stringify(profile));
			});
			
			this.setWXRMode(WXRDevice.AR);
			this.setWXRDeviceType(WXRDevice.MOBILE);
			
		} else {
			WXR.Device.getDesktopDeviceProfile(function () {

			});

			this.setWXRMode(WXRDevice.MODE3D);
			this.setWXRDeviceType(WXRDevice.DESKTOP);
		}
	}
	
	getWXRDeviceType() {
		return this.WXRDeviceType;
	}
	
	getWXRMode() {
		return this.WXRMode;
	}
	
	setWXRDeviceType(type) {
		this.WXRDeviceType = type;
	}
	
	setWXRMode(mode) {
		this.WXRMode = mode;
		this.changeWXRMode();
	}
	
	isMobile() {
		return WebVRPolyfill.prototype.isMobile();
	}
	
	changeWXRMode() {
		if (this.getWXRMode() === WXRDevice.AR) {
			WXREventUI.dispatchEvent({type: WXREventUI.MODE_CHANGED_AR});
			
		} else if (this.getWXRMode() === WXRDevice.MODE3D) {
			WXREventUI.dispatchEvent({type: WXREventUI.MODE_CHANGED_3D});
			
		} else if (this.getWXRMode() === WXRDevice.VR) {
			WXREventUI.dispatchEvent({type: WXREventUI.MODE_CHANGED_VR});

		}
	}
}

module.exports = WXRContextManager;
