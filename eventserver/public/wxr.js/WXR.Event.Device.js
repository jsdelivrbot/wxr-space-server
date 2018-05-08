'use strict';

class WXREventDevice {

	static dispatchEvent(event) {
		let customEvent;

		console.log(event);

		/*
		 * Event structure
		 * {
		 *   id: device_uuid
		 *   timestamp: timestamp
		 *   eventType: event type
		 *   detail: additional data
		 * }
		 */
		switch (event.type) {
			case WXREventDevice.HANDGESTURE_DETECTED:
				// customEvent = new CustomEvent(WXREvent.CAMERA_READY, {detail: event.camera});
				//
				// for (let cameraDOMElement of $(WXRCamera.is)) {
				// 	cameraDOMElement.dispatchEvent(customEvent);
				// }

				break;

			case HANDGESTURE_MOVED:
				// customEvent = new CustomEvent(WXREvent.AR_TARGET_DETECTED, {detail: event});
				//
				// for (let targetDOMElement of $(WXRTarget.is)) {
				// 	if( this.getRemoveProtocolPath(targetDOMElement.src) === this.getRemoveProtocolPath(event.target) ) {
				// 		targetDOMElement.dispatchEvent(customEvent);
				// 	}
				// }

				break;

			case HANDGESTURE_MISSED:
				// customEvent = new CustomEvent(WXREvent.AR_TARGET_MOVED, {detail: event});
				//
				// for (let targetDOMElement of $(WXRTarget.is)) {
				// 	if( this.getRemoveProtocolPath(targetDOMElement.src) === this.getRemoveProtocolPath(event.target) ) {
				// 		targetDOMElement.dispatchEvent(customEvent);
				// 	}
				// }

				break;

			default:
				break;
		}
	}
}

WXREventDevice.HANDGESTURE_DETECTED = 'HandGestureDetected';
WXREventDevice.HANDGESTURE_MOVED    = 'HandGestureMoved';
WXREventDevice.HANDGESTURE_MISSED   = 'HandGestureMissed';

module.exports = WXREventDevice;