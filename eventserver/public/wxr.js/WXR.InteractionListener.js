'use strict';

class WXRInteractionListener {
	constructor() {
		this._isInteractionEventServerEnabled = false;
		this._isWebizingDeviceManagerEnabled = false;
		this._interactionEventServerSocket = undefined;
		this._webizingDeviceManagerSocket = undefined;
	}

	static get interactionEventServerEnable() {
		return this._isInteractionEventServerEnabled;
	}

	static set interactionEventServerEnable(boolean) {
		// Normalize as boolean.
		boolean = !!boolean;

		this._isInteractionEventServerEnabled = boolean;

		if (boolean === true) {
			this._interactionEventServerSocket = io(WXRInteractionListener.INTERACTION_EVENT_SERVER_URI);

			// Dispatch the event from remote server.
			this._interactionEventServerSocket.on('WXREvent', event => {
				WXREventDevice.dispatchEvent(event);
			});
		}

	}

	static get webizingDeviceManagerEnable() {
		return this._isWebizingDeviceManagerEnabled;
	}

	static set webizingDeviceManagerEnable(boolean) {
		// Normalize as boolean.
		boolean = !!boolean;

		this._isWebizingDeviceManagerEnabled = boolean;
		
		if (boolean === true) {
			this._webizingDeviceManagerSocket = io(WXRInteractionListener.WEBIZING_DEVICE_MANAGER_URI);

			// Dispatch the event from local machine.
			this._webizingDeviceManagerSocket.on('WXREvent', event => {
				WXREventDevice.dispatchEvent(event);

				if (event.id !== 'device no id') {
					const deviceProfile = WXRWebizingDeviceConfigManager.getDeviceProfiles().find( p => p.id === event.id );
					if (!deviceProfile.isNoBroadcast && this._isInteractionEventServerEnabled) {
						this._interactionEventServerSocket.emit('WXREvent', event);
					}
				}
			});

		} else if (boolean === false) {
			// If webizingDeviceManagerSocket exist, close it.
			this._webizingDeviceManagerSocket && this._webizingDeviceManagerSocket.close && this._webizingDeviceManagerSocket.close();

			delete this._webizingDeviceManagerSocket;
		}
	}
	
}

WXRInteractionListener.TAG = "WXRInteractionListener";

WXRInteractionListener.INTERACTION_EVENT_SERVER_URI = window.location.hostname + ':6711';
WXRInteractionListener.WEBIZING_DEVICE_MANAGER_URI = 'http://localhost:6712';


module.exports = WXRInteractionListener;
