'use strict';

class WXREventUI {
	static dispatchEvent(event) {
		let customEvent;

		switch (event.type) {
			case WXREventUI.MODE_CHANGED_AR:
				this.targetClear();

				if (WXR.ARTrackerEngine !== undefined) {
					WXR.ARTrackerEngine.changeModeAR();
				} else {
					WXR.log(WXREventUI.LOGTAG, "not available ARTrackerEngine");
				}

				document.body.style.backgroundColor = 'rgba(255, 255, 255, 0)';

				for (let spaceDomElement of $(WXRSpace.is)) {
					for (let targetDomElement of spaceDomElement.children) {
						targetDomElement.style.display = "none";
					}
				}

				WXR.WebVR.exitWebVR();

				$(WXRDebugUI.is).show();
				$(WXRLayerUI.is).show();
				$(WXRSliderUI.is).show();

				break;

			case WXREventUI.MODE_CHANGED_3D:
				this.targetClear();

				if (WXR.ARTrackerEngine !== undefined) {
					WXR.ARTrackerEngine.changeMode3D();
				} else {
					WXR.log(WXREvent.LOGTAG, "not available ARTrackerEngine");
				}

				document.body.style.backgroundColor = 'rgba(255, 255, 255, 1)';

				for (let spaceDomElement of $(WXRSpace.is)) {
					if (spaceDomElement.enable === true) {
						for (let targetDomElement of spaceDomElement.children) {
							if (targetDomElement.tagName.toLowerCase() === WXRTarget.is) {
								targetDomElement.style.display = "block";
								WXREvent.dispatchEvent({type: WXREvent.TARGET_ABAILABLE, target: targetDomElement});
							}
						}
					}
				}

				WXR.WebVR.exitWebVR();

				$(WXRDebugUI.is).show();
				$(WXRLayerUI.is).show();
				$(WXRSliderUI.is).show();

				if($(WXRCamera.is).length > 0) {
					let cameraDomElement = $(WXRCamera.is)[0];

					WXREvent.dispatchEvent({type: WXREvent.CAMERA_READY, camera: {
							fovy: cameraDomElement.fovy,
							aspect: cameraDomElement.aspect,
							near: cameraDomElement.near,
							far: cameraDomElement.far
						}
					});
				} else {
					WXR.log(WXREventUI.LOGTAG, "cannot found camera DOM");
				}

				break;

			case WXREventUI.MODE_CHANGED_VR:
				this.targetClear();

				if (WXR.ARTrackerEngine !== undefined) {
					WXR.ARTrackerEngine.changeModeVR();
				} else {
					WXR.log(WXREventUI.LOGTAG, "not available ARTrackerEngine");
				}

				document.body.style.backgroundColor = 'rgba(255, 255, 255, 1)';

				for (let spaceDomElement of $(WXRSpace.is)) {
					if (spaceDomElement.enable === true) {
						for (let targetDomElement of spaceDomElement.children) {
							if (targetDomElement.tagName.toLowerCase() === WXRTarget.is) {
								targetDomElement.style.display = "block";
								WXREvent.dispatchEvent({type: WXREvent.TARGET_ABAILABLE, target: targetDomElement});
							}
						}
					}
				}

				if($(WXRCamera.is).length > 0) {
					let cameraDomElement = $(WXRCamera.is)[0];

					WXREvent.dispatchEvent({type: WXREvent.CAMERA_READY, camera: {
							fovy: cameraDomElement.fovy,
							aspect: cameraDomElement.aspect,
							near: cameraDomElement.near,
							far: cameraDomElement.far
						}
					});
				} else {
					WXR.log(WXREventUI.LOGTAG, "cannot found camera DOM");
				}

				WXR.WebVR.enterWebVR();

				$(WXRDebugUI.is).hide();
				$(WXRLayerUI.is).hide();
				$(WXRSliderUI.is).hide();

				break;

		}
	}

	static targetClear() {
		TWEEN.removeAll();

		for (let targetDomElement of $(WXRTarget.is)) {
			targetDomElement.clearObject3D();
		}
	}
}

WXREventUI.MODE_CHANGED_3D = "3DModeChanged";
WXREventUI.MODE_CHANGED_AR = "ARModeChanged";
WXREventUI.MODE_CHANGED_VR = "VRModeChanged";
WXREventUI.LOGTAG = "WXREventUI";

module.exports = WXREventUI;
