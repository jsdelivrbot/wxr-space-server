'use strict';

class WXREvent {

	static dispatchEvent(event) {
		let customEvent;

		switch (event.type) {
			case WXREvent.CAMERA_READY:
				customEvent = new CustomEvent(WXREvent.CAMERA_READY, {detail: event.camera});

				for (let cameraDOMElement of $(WXRCamera.is)) {
					cameraDOMElement.dispatchEvent(customEvent);
				}

				break;

			case WXREvent.AR_TARGET_DETECTED:
				customEvent = new CustomEvent(WXREvent.AR_TARGET_DETECTED, {detail: event});

				for (let targetDOMElement of $(WXRTarget.is)) {
					if( this.getRemoveProtocolPath(targetDOMElement.src) === this.getRemoveProtocolPath(event.target) ) {
						targetDOMElement.dispatchEvent(customEvent);
					}
				}

				break;

			case WXREvent.AR_TARGET_MOVED:
				customEvent = new CustomEvent(WXREvent.AR_TARGET_MOVED, {detail: event});

				for (let targetDOMElement of $(WXRTarget.is)) {
					if( this.getRemoveProtocolPath(targetDOMElement.src) === this.getRemoveProtocolPath(event.target) ) {
						targetDOMElement.dispatchEvent(customEvent);
					}
				}

				break;

			case WXREvent.AR_TARGET_MISSED:
				customEvent = new CustomEvent(WXREvent.AR_TARGET_MISSED, {detail: event.target});

				for (let targetDOMElement of $(WXRTarget.is)) {
					if( this.getRemoveProtocolPath(targetDOMElement.src) === this.getRemoveProtocolPath(event.target) ) {
						targetDOMElement.dispatchEvent(customEvent);
					}
				}

				break;

			case WXREvent.SPACE_CHECKIN:
				customEvent = new CustomEvent(WXREvent.SPACE_CHECKIN, {detail: event});
				event.target.dispatchEvent(customEvent);

				break;

			case WXREvent.SPACE_CHECKOUT:
				customEvent = new CustomEvent(WXREvent.SPACE_CHECKOUT, {detail: event});
				event.target.dispatchEvent(customEvent);

				break;

			case WXREvent.BEACON_DETECTED:
				for (let domElement of $(`[src=\'${event.beacon}\']`)) {
					WXR.SpaceManager.enterSpace(domElement);
				}

				break;

			case WXREvent.BEACON_MISSED:
				for (let domElement of $(`[src=\'${event.beacon}\']`)) {
					WXR.SpaceManager.exitSpace(domElement);
				}

				break;

			case WXREvent.GEOMETRY_ON_MOUSE_DOWN:
				let mouseEvent = document.createEvent('MouseEvents');
				mouseEvent.initMouseEvent( WXREvent.GEOMETRY_ON_CLICK,
					event.params.canBubble,
					event.params.cancelable,
					event.params.view,
					event.params.detail,
					event.params.screenX,
					event.params.screenY,
					event.params.clientX,
					event.params.clientY,
					event.params.ctrlKey,
					event.params.altKey,
					event.params.shiftKey,
					event.params.metaKey,
					event.params.button,
					event.params.relatedTarget);

				mouseEvent.vectorX = event.params.vectorX;
				mouseEvent.vectorY = event.params.vectorY;
				mouseEvent.vectorZ = event.params.vectorZ;

				this.traverseDomBottomUp(event.target, domElement => {
					domElement.dispatchEvent(mouseEvent);
				});

				break;

			case WXREvent.GEOMETRY_ON_TOUCH_START:
				customEvent = new CustomEvent(WXREvent.GEOMETRY_ON_CLICK, {
					detail: {
						params: {
							touches: event.params.touches,
							changedTouches: event.params.changedTouches,
							targetTouches: event.params.targetTouches,
							vectorX : event.params.vectorX,
							vectorY : event.params.vectorY,
							vectorZ : event.params.vectorZ,
						},
						part: event.part
					}
				});

				this.traverseDomBottomUp(event.target, domElement => {
					domElement.dispatchEvent(customEvent);
				});

				break;

			case WXREvent.TARGET_ABAILABLE:
				this.traverseDOMTopDown(event.target, domElement => {
					customEvent = new CustomEvent(event.type, {});
					domElement.dispatchEvent(customEvent);
				});
				break;

			default:
				break;
		}
	}

	static traverseDomBottomUp(domElement, callback) {
		callback(domElement);

		if (!domElement.tagName.toLocaleLowerCase().startsWith(WXRWorld.is)) {
			this.traverseDomBottomUp(domElement.parentElement, callback);
		}
	}

	static traverseDOMTopDown(domElement, callback) {
		callback(domElement);

		if(domElement.children.length > 0) {
			for(let dom of domElement.children) {
				this.traverseDOMTopDown(dom, callback);
			}
		}
	}

	static getRemoveProtocolPath(url) {
		return url.slice(url.indexOf("//"+2, url.length));
	}
}

WXREvent.CAMERA_READY = "WXRCameraReady";

WXREvent.BEACON_DETECTED = "WXRBeaconDetected";
WXREvent.BEACON_MISSED = "WXRBeaconMissed";
WXREvent.SPACE_CHECKIN = "WXRSpaceCheck-in";
WXREvent.SPACE_CHECKOUT = "WXRSpaceCheckout";
WXREvent.AR_TARGET_DETECTED = "WXRARTargetDetected";
WXREvent.AR_TARGET_MOVED = "WXRARTargetMoved";
WXREvent.AR_TARGET_MISSED = "WXRARTargetMissed";

WXREvent.GEOMETRY_ON_MOUSE_DOWN = "mousedown";
WXREvent.GEOMETRY_ON_TOUCH_START = "touchstart";
WXREvent.ON_MOUSE_DOWN = "mousedown";
WXREvent.ON_TOUCH_START = "touchstart";
WXREvent.GEOMETRY_ON_CLICK = "click";

WXREvent.TARGET_ABAILABLE = "WXRTargetAvailable";
WXREvent.LOGTAG = "WXREvent";

module.exports = WXREvent;
