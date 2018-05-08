'use strict';

class WXRWebizingDeviceConfigManager {


	constructor() {
		this._profileUpdateListeners = [];
		this._deviceProfiles = [];

		this._webizingDeviceManagerSocket = undefined;
		this._isWebizingDeviceManagerEnabled = false;
	}


	get webizingDeviceManagerEnable() {
		return this._isWebizingDeviceManagerEnabled;
	}

	set webizingDeviceManagerEnable(boolean) {
		// Normalize as boolean.
		boolean = !!boolean;

		this._isWebizingDeviceManagerEnabled = boolean;

		if (boolean === true) {
			this._webizingDeviceManagerSocket = io(WXRWebizingDeviceConfigManager.WEBIZING_DEVICE_MANAGER_URI);

			this._webizingDeviceManagerSocket.on('connect', function () {
				this._webizingDeviceManagerSocket.emit('WXRUpdateDeviceProfiles', this._deviceProfiles);
			});

			this._webizingDeviceManagerSocket.on('WXRUpdateDeviceProfiles', function (profiles) {
				this._deviceProfiles = profiles;
				this._profileUpdateListeners.forEach(listener => listener(profiles));
			});

			this._webizingDeviceManagerSocket.on('error', function (err) {
			});

			// Get DeviceProfiles from server
			$.ajax(WXRWebizingDeviceConfigManager.HOST_URL + `/users/me/devices`)
				.done(data => {
					if (data.status === 'ok') {
						this._deviceProfiles = data.message;
						this._webizingDeviceManagerSocket.emit('WXRUpdateDeviceProfiles', this._deviceProfiles);
					}
				});

		} else if (boolean === false) {
			// If webizingDeviceManagerSocket exist, close it.
			this._webizingDeviceManagerSocket && this._webizingDeviceManagerSocket.close && this._webizingDeviceManagerSocket.close();

			delete this._webizingDeviceManagerSocket;
		}
	}



	addUpdateListener(listener) {
		this._profileUpdateListeners.push(listener);
	}

	getDeviceProfiles() {
		return [].concat(this._deviceProfiles);
	}

	registerProfile(profile, callback) {
		callback = callback || new Function();

		// If there is profile matching with device and name...
		if (this.findIndexInDeviceProfiles(profile) >= 0) {
			$.ajax({
				type: 'POST',
				url: WXRWebizingDeviceConfigManager.HOST_URL + `/devices`,
				data: profile,
			})
				.done( data => {

					if (data.status === 'ok') {
						const index = this.findIndexInDeviceProfiles(profile);
						this._deviceProfiles[index] = data.message;
					}

					this._webizingDeviceManagerSocket.emit('WXRUpdateDeviceProfiles', this._deviceProfiles);
					callback(data);
				});
		}
	}

	updateProfile(id, profile, callback) {
		callback = callback || new Function();

		// Given with device id
		if (!!id === true) {

			$.ajax({
				type: 'PUT',
				url: WXRWebizingDeviceConfigManager.HOST_URL + `/devices/${id}`,
				data: profile,
			})
				.done(data => {
					if (data.status === 'ok') {
						const index = this._deviceProfiles.findIndex(p => p.id === id);
						this._deviceProfiles[index] = data.message;
					}

					if (this._webizingDeviceManagerSocket) {
						this._webizingDeviceManagerSocket.emit('WXRUpdateDeviceProfiles', this._deviceProfiles);
					}
					callback(data);
				});
		}
	}

	deleteProfile(id, callback) {
		callback = callback || new Function();

		// If there is profile matching with device and name...
		if (!!id === true) {
			$.ajax({
				type: 'DELETE',
				url: WXRWebizingDeviceConfigManager.HOST_URL + `/devices/${id}`,
			})
				.done(data => {
					if (data.status === 'ok') {
						const index = this._deviceProfiles.findIndex(p => p.id === id);
						if (index !== -1) {
							this._deviceProfiles.splice(index, 1);
							if (this._webizingDeviceManagerSocket) {
								this._webizingDeviceManagerSocket.emit('WXRUpdateDeviceProfiles', this._deviceProfiles);
							}
						}
					}
					callback(data);
				});
		}
	}


	findIndexInDeviceProfiles(profile) {
		if (!profile.device || !profile.name) return -2;
		return this._deviceProfiles.findIndex( p => p.device === profile.device && p.name === profile.name );
	}
}

WXRWebizingDeviceConfigManager.TAG = "WXRWebizingDeviceConfigManager";


WXRWebizingDeviceConfigManager.HOST_URL = window.location.host;
WXRWebizingDeviceConfigManager.WEBIZING_DEVICE_MANAGER_URI = 'http://localhost:6712';

module.exports = WXRWebizingDeviceConfigManager;
