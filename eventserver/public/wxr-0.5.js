/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 17);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;

var WXR = { REVISION: '0.3-dev-three.r90' };
var WXRClass = {};

if (true) {
	!(__WEBPACK_AMD_DEFINE_FACTORY__ = (WXR),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module)) :
				__WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
} else {}

WXR.PREFIX_WXR = "WXR-";
WXR.debug = false;

WXR.log = function (tag, msg) {
	if (WXR.debug === true) {
		console.log(tag);
		console.log(msg);
	}
};

WXR.log('WXR', WXR.REVISION);

module.exports = { WXR: WXR, WXRClass: WXRClass };

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


WXR.Platform = {};
WXR.Platform.Android = "Android";
WXR.Platform.iOS = "iOS";
WXR.Platform.Windows = "Windows";

// for WXR classes
WXRClass.ARTrackerListener = WXRARTrackerListener;
WXRClass.ContextManager = WXRContextManager;
WXRClass.Device = WXRDevice;
WXRClass.WebVR = WXRWebVR;
WXRClass.Event = WXREvent;
WXRClass.EventDevice = WXREventDevice;
WXRClass.EventUI = WXREventUI;
WXRClass.Sensor = WXRSensor;
WXRClass.SpaceManager = WXRSpaceManager;
WXRClass.LocationManager = WXRLocationManager;
WXRClass.InteractionListener = WXRInteractionListener;
WXRClass.WebizingDeviceConfigManager = WXRWebizingDeviceConfigManager;

// for WXR Android native variables
switch (platform.os.family) {
	case WXR.Platform.Android:
		WXR.ARTrackerEngine = window.WXRARTrackerEngine;
		WXR.SensorManager = window.WXRSensorManager;
		WXR.Setting = window.WXRSetting;
		WXR.TargetManager = window.WXRTargetManager;
		break;

	case WXR.Platform.iOS:
		WXR.ARTrackerEngine = {};
		WXR.ARTrackerEngine.loadTarget = function (data) {
			window.webkit.messageHandlers.loadTargets.postMessage(data);
		};
		WXR.SensorManager = window.webkit.messageHandlers.WXRSensorManager;
		WXR.Setting = window.webkit.messageHandlers.WXRSetting;
		WXR.TargetManager = window.webkit.messageHandlers.WXRTargetManager;
		break;
}

// for WXR variables
WXR.ARTrackerListener = new WXRClass.ARTrackerListener();
WXR.ContextManager = new WXRClass.ContextManager();
WXR.Device = new WXRClass.Device();
WXR.WebVR = new WXRClass.WebVR();
WXR.Event = new WXRClass.Event();
WXR.Event.Device = new WXRClass.EventDevice();
WXR.Event.UI = new WXRClass.EventUI();
WXR.Sensor = new WXRClass.Sensor();
WXR.SpaceManager = new WXRClass.SpaceManager();
WXR.LocationManager = new WXRClass.LocationManager();
WXR.InteractionListener = new WXRClass.InteractionListener();
WXR.WebizingDeviceConfigManager = new WXRClass.WebizingDeviceConfigManager();

// for WXR init
$(function () {
	WXR.debug = true;
	WXR.ContextManager.checkWXRMode();
	WXR.LocationManager.init();
});

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var WXRInteractionListener = function () {
	function WXRInteractionListener() {
		_classCallCheck(this, WXRInteractionListener);

		this._isInteractionEventServerEnabled = false;
		this._isWebizingDeviceManagerEnabled = false;
		this._interactionEventServerSocket = undefined;
		this._webizingDeviceManagerSocket = undefined;
	}

	_createClass(WXRInteractionListener, [{
		key: 'interactionEventServerEnable',
		get: function get() {
			return this._isInteractionEventServerEnabled;
		},
		set: function set(boolean) {
			// Normalize as boolean.
			boolean = !!boolean;

			this._isInteractionEventServerEnabled = boolean;

			if (boolean === true) {
				this._interactionEventServerSocket = io(WXRInteractionListener.INTERACTION_EVENT_SERVER_URI);

				// Dispatch the event from remote server.
				this._interactionEventServerSocket.on('WXREvent', function (event) {
					WXREventDevice.dispatchEvent(event);
				});
			}
		}
	}, {
		key: 'webizingDeviceManagerEnable',
		get: function get() {
			return this._isWebizingDeviceManagerEnabled;
		},
		set: function set(boolean) {
			var _this = this;

			// Normalize as boolean.
			boolean = !!boolean;

			this._isWebizingDeviceManagerEnabled = boolean;
			if (boolean === true) {
				this._webizingDeviceManagerSocket = io(WXRInteractionListener.WEBIZING_DEVICE_MANAGER_URI);

				// Dispatch the event from local machine.
				this._webizingDeviceManagerSocket.on('WXREvent', function (event) {
					WXREventDevice.dispatchEvent(event);

					if (event.id !== 'device no id') {
						var deviceProfile = WXR.WebizingDeviceConfigManager.getDeviceProfiles().find(function (p) {
							return p.id === event.id;
						});
						if (!deviceProfile.isNoBroadcast && _this._isInteractionEventServerEnabled) {
							_this._interactionEventServerSocket.emit('WXREvent', event);
						}
					}
				});
			} else if (boolean === false) {
				// If webizingDeviceManagerSocket exist, close it.
				this._webizingDeviceManagerSocket && this._webizingDeviceManagerSocket.close && this._webizingDeviceManagerSocket.close();

				delete this._webizingDeviceManagerSocket;
			}
		}
	}]);

	return WXRInteractionListener;
}();

WXRInteractionListener.TAG = "WXRInteractionListener";

WXRInteractionListener.INTERACTION_EVENT_SERVER_URI = window.location.hostname + ':6711';
WXRInteractionListener.WEBIZING_DEVICE_MANAGER_URI = 'http://localhost:6712';

module.exports = WXRInteractionListener;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var WXRWebizingDeviceConfigManager = function () {
	function WXRWebizingDeviceConfigManager() {
		_classCallCheck(this, WXRWebizingDeviceConfigManager);

		this._profileUpdateListeners = [];
		this._deviceProfiles = [];

		this._webizingDeviceManagerSocket = undefined;
		this._isWebizingDeviceManagerEnabled = false;
	}

	_createClass(WXRWebizingDeviceConfigManager, [{
		key: 'addUpdateListener',
		value: function addUpdateListener(listener) {
			this._profileUpdateListeners.push(listener);
		}
	}, {
		key: 'getDeviceProfiles',
		value: function getDeviceProfiles() {
			return [].concat(this._deviceProfiles);
		}
	}, {
		key: 'registerProfile',
		value: function registerProfile(profile, callback) {
			var _this = this;

			callback = callback || new Function();

			// If there is profile matching with device and name...
			if (this.findIndexInDeviceProfiles(profile) >= 0) {
				$.ajax({
					type: 'POST',
					url: '//' + WXRWebizingDeviceConfigManager.HOST_URL + '/devices',
					data: profile
				}).done(function (data) {

					if (data.status === 'ok') {
						var index = _this.findIndexInDeviceProfiles(profile);
						_this._deviceProfiles[index] = data.message;
					}

					_this._webizingDeviceManagerSocket.emit('WXRUpdateDeviceProfiles', _this._deviceProfiles);
					callback(data);
				});
			}
		}
	}, {
		key: 'updateProfile',
		value: function updateProfile(id, profile, callback) {
			var _this2 = this;

			callback = callback || new Function();

			// Given with device id
			if (!!id === true) {

				$.ajax({
					type: 'PUT',
					url: '//' + WXRWebizingDeviceConfigManager.HOST_URL + ('/devices/' + id),
					data: profile
				}).done(function (data) {
					if (data.status === 'ok') {
						var index = _this2._deviceProfiles.findIndex(function (p) {
							return p.id === id;
						});
						_this2._deviceProfiles[index] = data.message;
					}

					if (_this2._webizingDeviceManagerSocket) {
						_this2._webizingDeviceManagerSocket.emit('WXRUpdateDeviceProfiles', _this2._deviceProfiles);
					}
					callback(data);
				});
			}
		}
	}, {
		key: 'deleteProfile',
		value: function deleteProfile(id, callback) {
			var _this3 = this;

			callback = callback || new Function();

			// If there is profile matching with device and name...
			if (!!id === true) {
				$.ajax({
					type: 'DELETE',
					url: '//' + WXRWebizingDeviceConfigManager.HOST_URL + ('/devices/' + id)
				}).done(function (data) {
					if (data.status === 'ok') {
						var index = _this3._deviceProfiles.findIndex(function (p) {
							return p.id === id;
						});
						if (index !== -1) {
							_this3._deviceProfiles.splice(index, 1);
							if (_this3._webizingDeviceManagerSocket) {
								_this3._webizingDeviceManagerSocket.emit('WXRUpdateDeviceProfiles', _this3._deviceProfiles);
							}
						}
					}
					callback(data);
				});
			}
		}
	}, {
		key: 'findIndexInDeviceProfiles',
		value: function findIndexInDeviceProfiles(profile) {
			if (!profile.device || !profile.name) return -2;
			return this._deviceProfiles.findIndex(function (p) {
				return p.device === profile.device && p.name === profile.name;
			});
		}
	}, {
		key: 'webizingDeviceManagerEnable',
		get: function get() {
			return this._isWebizingDeviceManagerEnabled;
		},
		set: function set(boolean) {
			var _this4 = this;

			// Normalize as boolean.
			boolean = !!boolean;

			this._isWebizingDeviceManagerEnabled = boolean;

			if (boolean === true) {
				this._webizingDeviceManagerSocket = io(WXRWebizingDeviceConfigManager.WEBIZING_DEVICE_MANAGER_URI);

				this._webizingDeviceManagerSocket.on('connect', function () {
					_this4._webizingDeviceManagerSocket.emit('WXRUpdateDeviceProfiles', _this4._deviceProfiles);
				});

				this._webizingDeviceManagerSocket.on('WXRUpdateDeviceProfiles', function (profiles) {
					_this4._deviceProfiles = profiles;
					_this4._profileUpdateListeners.forEach(function (listener) {
						return listener(profiles);
					});
				});

				this._webizingDeviceManagerSocket.on('error', function (err) {});

				// Get DeviceProfiles from server
				$.ajax('//' + WXRWebizingDeviceConfigManager.HOST_URL + '/users/me/devices').done(function (data) {
					if (data.status === 'ok') {
						_this4._deviceProfiles = data.message;
						_this4._webizingDeviceManagerSocket.emit('WXRUpdateDeviceProfiles', _this4._deviceProfiles);
					}
				});
			} else if (boolean === false) {
				// If webizingDeviceManagerSocket exist, close it.
				this._webizingDeviceManagerSocket && this._webizingDeviceManagerSocket.close && this._webizingDeviceManagerSocket.close();

				delete this._webizingDeviceManagerSocket;
			}
		}
	}]);

	return WXRWebizingDeviceConfigManager;
}();

WXRWebizingDeviceConfigManager.TAG = "WXRWebizingDeviceConfigManager";

WXRWebizingDeviceConfigManager.HOST_URL = window.location.host;
WXRWebizingDeviceConfigManager.WEBIZING_DEVICE_MANAGER_URI = 'http://localhost:6712';

module.exports = WXRWebizingDeviceConfigManager;

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var WXRARTrackerListener = function () {
	function WXRARTrackerListener() {
		_classCallCheck(this, WXRARTrackerListener);
	}

	_createClass(WXRARTrackerListener, [{
		key: "onCameraReady",
		value: function onCameraReady(cameraProjectionMatrix) {
			var projection = this.calcProjection(cameraProjectionMatrix, "portrait");

			var cameraParams = {
				fovy: projection.fovy,
				aspect: window.innerWidth / window.innerHeight,
				near: projection.near,
				far: projection.far
			};

			WXREvent.dispatchEvent({ type: WXREvent.CAMERA_READY, camera: cameraParams });
		}
	}, {
		key: "onTargetLoaded",
		value: function onTargetLoaded(urlTarget) {}
	}, {
		key: "onTargetDetected",
		value: function onTargetDetected(targetURL, targetType, targetSize) {
			var size = {
				width: targetSize[0],
				height: targetSize[1],
				depth: targetSize[2]
			};

			WXREvent.dispatchEvent({
				type: WXREvent.AR_TARGET_DETECTED,
				target: targetURL,
				tracker: targetType,
				size: size
			});
		}
	}, {
		key: "onTargetMoved",
		value: function onTargetMoved(targetURL, modelViewMatrix) {
			var matrix4 = new THREE.Matrix4();
			matrix4.elements = modelViewMatrix;

			WXREvent.dispatchEvent({
				type: WXREvent.AR_TARGET_MOVED,
				target: targetURL,
				transform: matrix4
			});
		}
	}, {
		key: "onTargetMissed",
		value: function onTargetMissed(targetURL) {
			WXREvent.dispatchEvent({
				type: WXREvent.AR_TARGET_MISSED,
				target: targetURL
			});
		}
	}, {
		key: "calcProjection",
		value: function calcProjection(matrix) {
			var fovy = 2 * Math.atan(1 / -matrix[1]) * (180 / Math.PI);
			var r = matrix[1] / matrix[4];
			var n = matrix[14] / (-matrix[10] - 1);
			var f = matrix[14] / (-matrix[10] + 1);

			return {
				fovy: fovy,
				ratio: r,
				near: n,
				far: f
			};
		}
	}, {
		key: "getDistanceFromXYZ",
		value: function getDistanceFromXYZ(x, y, z) {
			var distance = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2) + Math.pow(z, 2));

			return distance;
		}
	}]);

	return WXRARTrackerListener;
}();

module.exports = WXRARTrackerListener;

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var WXRContextManager = function () {
	function WXRContextManager() {
		_classCallCheck(this, WXRContextManager);
	}

	_createClass(WXRContextManager, [{
		key: 'checkWXRMode',
		value: function checkWXRMode() {
			if (this.isMobile()) {
				WXR.Device.getMobileDeviceProfile(function (profile) {
					// console.log(JSON.stringify(profile));
				});

				this.setWXRMode(WXRDevice.AR);
				this.setWXRDeviceType(WXRDevice.MOBILE);
			} else {
				WXR.Device.getDesktopDeviceProfile(function () {});

				this.setWXRMode(WXRDevice.MODE3D);
				this.setWXRDeviceType(WXRDevice.DESKTOP);
			}
		}
	}, {
		key: 'getWXRDeviceType',
		value: function getWXRDeviceType() {
			return this.WXRDeviceType;
		}
	}, {
		key: 'getWXRMode',
		value: function getWXRMode() {
			return this.WXRMode;
		}
	}, {
		key: 'setWXRDeviceType',
		value: function setWXRDeviceType(type) {
			this.WXRDeviceType = type;
		}
	}, {
		key: 'setWXRMode',
		value: function setWXRMode(mode) {
			this.WXRMode = mode;
			this.changeWXRMode();
		}
	}, {
		key: 'isMobile',
		value: function isMobile() {
			return WebVRPolyfill.prototype.isMobile();
		}
	}, {
		key: 'changeWXRMode',
		value: function changeWXRMode() {
			if (this.getWXRMode() === WXRDevice.AR) {
				WXREventUI.dispatchEvent({ type: WXREventUI.MODE_CHANGED_AR });
			} else if (this.getWXRMode() === WXRDevice.MODE3D) {
				WXREventUI.dispatchEvent({ type: WXREventUI.MODE_CHANGED_3D });
			} else if (this.getWXRMode() === WXRDevice.VR) {
				WXREventUI.dispatchEvent({ type: WXREventUI.MODE_CHANGED_VR });
			}
		}
	}]);

	return WXRContextManager;
}();

module.exports = WXRContextManager;

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var WXRDevice = function () {
	function WXRDevice() {
		_classCallCheck(this, WXRDevice);
	}

	_createClass(WXRDevice, [{
		key: 'mobileInfo',
		value: function mobileInfo(dpdb) {
			var userAgent = navigator.userAgent || navigator.vendor || window.opera;

			// webVR의 Util.getScreenWidth, getScreenHeight
			var width = Math.max(window.screen.width, window.screen.height) * window.devicePixelRatio;
			var height = Math.min(window.screen.width, window.screen.height) * window.devicePixelRatio;

			for (var i = 0; i < dpdb.devices.length; i++) {
				var device = dpdb.devices[i];

				if (!device.rules) {
					console.warn('Device[' + i + '] has no rules section.');
					continue;
				}

				if (device.type !== WXRDevice.IOS && device.type !== WXRDevice.ANDROID) {
					console.warn('Device[' + i + '] has invalid type.');
					continue;
				}

				var matched = false;

				for (var j = 0; j < device.rules.length; j++) {
					var rule = device.rules[j];
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
	}, {
		key: 'matchRule_',
		value: function matchRule_(rule, ua, screenWidth, screenHeight) {
			if (!rule.ua && !rule.res) return false;

			// If our user agent string doesn't contain the indicated user agent string,
			// the match fails.
			if (rule.ua && ua.indexOf(rule.ua) < 0) return false;

			// If the rule specifies screen dimensions that don't correspond to ours,
			// the match fails.
			if (rule.res) {
				if (!rule.res[0] || !rule.res[1]) return false;
				var resX = rule.res[0];
				var resY = rule.res[1];
				// Compare min and max so as to make the order not matter, i.e., it should
				// be true that 640x480 == 480x640.
				if (Math.min(screenWidth, screenHeight) != Math.min(resX, resY) || Math.max(screenWidth, screenHeight) != Math.max(resX, resY)) {
					return false;
				}
			}

			return true;
		}
	}, {
		key: 'getMobileDeviceProfile',
		value: function getMobileDeviceProfile(callback) {
			var ONLINE_DPDB_URL = 'https://dpdb.webvr.rocks/dpdb.json';
			var that = this;

			$.ajax({
				url: ONLINE_DPDB_URL,
				success: function success(dpdb) {
					callback(that.mobileInfo(dpdb));
				}
			});
		}
	}, {
		key: 'getDesktopDeviceProfile',
		value: function getDesktopDeviceProfile(callback) {
			callback();
		}
	}]);

	return WXRDevice;
}();

WXRDevice.AR = "AR";
WXRDevice.VR = "VR";
WXRDevice.MODE3D = "3D";
WXRDevice.MOBILE = "mobile";
WXRDevice.DESKTOP = "desktop";
WXRDevice.IOS = "ios";
WXRDevice.ANDROID = "android";

module.exports = WXRDevice;

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var WXRLocationManager = function () {
	function WXRLocationManager() {
		_classCallCheck(this, WXRLocationManager);

		this.beacons = [];
		this.timers = [];
	}

	_createClass(WXRLocationManager, [{
		key: 'init',
		value: function init() {
			var _this = this;

			if (WXR.ContextManager.getWXRDeviceType() === WXRDevice.MOBILE) {
				var appearId = WXR.Sensor.addEventListener('appear', [], this.appearBeacons.bind(this));
				var disappearId = WXR.Sensor.addEventListener('disappear', [], this.disappearBeacons.bind(this));

				this.getCurrentBeacons(function (beacons, err) {
					if (err) {
						WXR.log(WXRLocationManager.TAG, err);
						return;
					}

					WXR.log(WXRLocationManager.TAG, "init Beacons: " + beacons);

					var _iteratorNormalCompletion = true;
					var _didIteratorError = false;
					var _iteratorError = undefined;

					try {
						for (var _iterator = beacons[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
							var beacon = _step.value;

							if (_this.beacons.indexOf(beacon) === -1) {
								_this.beacons.push(beacon);
								WXREvent.dispatchEvent({ type: WXREvent.BEACON_DETECTED, beacon: beacon });
							}
						}
					} catch (err) {
						_didIteratorError = true;
						_iteratorError = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion && _iterator.return) {
								_iterator.return();
							}
						} finally {
							if (_didIteratorError) {
								throw _iteratorError;
							}
						}
					}
				});
			}
		}
	}, {
		key: 'getCurrentBeacons',
		value: function getCurrentBeacons(callback) {
			WXR.Sensor.getCurrentBeacons(function (beacons, err) {

				WXR.log(WXRLocationManager.TAG, "current beacons: " + beacons);

				callback(beacons, err);
			});
		}
	}, {
		key: 'watchBeacons',
		value: function watchBeacons(callback, sec) {
			var timerId = setInterval(function () {
				WXR.Sensor.getCurrentBeacons(function (beacons, err) {
					if (err) {
						WXR.log(WXRLocationManager.TAG, err);
						return;
					}

					WXR.log(WXRLocationManager.TAG, "get beacons: " + beacons);

					var _iteratorNormalCompletion2 = true;
					var _didIteratorError2 = false;
					var _iteratorError2 = undefined;

					try {
						for (var _iterator2 = beacons[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
							var beacon = _step2.value;

							callback(beacon, timerId);
						}
					} catch (err) {
						_didIteratorError2 = true;
						_iteratorError2 = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion2 && _iterator2.return) {
								_iterator2.return();
							}
						} finally {
							if (_didIteratorError2) {
								throw _iteratorError2;
							}
						}
					}
				});
			}, sec);

			this.timers.push(timerId);
		}
	}, {
		key: 'appearBeacons',
		value: function appearBeacons(beacons, err) {
			if (err) {
				WXR.log(WXRLocationManager.TAG, err);
				return;
			}

			WXR.log(WXRLocationManager.TAG, "appear: " + beacons);

			var _iteratorNormalCompletion3 = true;
			var _didIteratorError3 = false;
			var _iteratorError3 = undefined;

			try {
				for (var _iterator3 = beacons[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
					var beacon = _step3.value;

					if (this.beacons.indexOf(beacon) === -1) {
						this.beacons.push(beacon);
						WXREvent.dispatchEvent({ type: WXREvent.BEACON_DETECTED, beacon: beacon });
					} else {
						WXR.log(WXRLocationManager.TAG, "beacons have " + beacon);
					}
				}
			} catch (err) {
				_didIteratorError3 = true;
				_iteratorError3 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion3 && _iterator3.return) {
						_iterator3.return();
					}
				} finally {
					if (_didIteratorError3) {
						throw _iteratorError3;
					}
				}
			}
		}
	}, {
		key: 'disappearBeacons',
		value: function disappearBeacons(beacons, err) {
			if (err) {
				WXR.log(WXRLocationManager.TAG, err);
				return;
			}

			WXR.log(WXRLocationManager.TAG, "disappear: " + beacons);

			var _iteratorNormalCompletion4 = true;
			var _didIteratorError4 = false;
			var _iteratorError4 = undefined;

			try {
				for (var _iterator4 = beacons[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
					var beacon = _step4.value;

					var index = this.beacons.indexOf(beacon);

					if (index !== -1) {
						WXREvent.dispatchEvent({ type: WXREvent.BEACON_MISSED, beacon: beacon });
						this.beacons.splice(index, 1);
					}
				}
			} catch (err) {
				_didIteratorError4 = true;
				_iteratorError4 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion4 && _iterator4.return) {
						_iterator4.return();
					}
				} finally {
					if (_didIteratorError4) {
						throw _iteratorError4;
					}
				}
			}
		}
	}, {
		key: 'removeWatch',
		value: function removeWatch(timerId) {
			var index = this.timers.indexOf(timerId);

			if (index !== -1) {
				clearInterval(timerId);
				this.timers.splice(index, index - 1);
			}
		}
	}]);

	return WXRLocationManager;
}();

WXRLocationManager.TAG = "WXRLocationManager";

module.exports = WXRLocationManager;

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var WXREvent = function () {
	function WXREvent() {
		_classCallCheck(this, WXREvent);
	}

	_createClass(WXREvent, null, [{
		key: 'dispatchEvent',
		value: function dispatchEvent(event) {
			var customEvent = void 0;

			switch (event.type) {
				case WXREvent.CAMERA_READY:
					customEvent = new CustomEvent(WXREvent.CAMERA_READY, { detail: event.camera });

					$(WXRCamera.is);
					var _iteratorNormalCompletion = true;
					var _didIteratorError = false;
					var _iteratorError = undefined;

					try {
						for (var _iterator = $(WXRCamera.is)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
							var cameraDOMElement = _step.value;

							cameraDOMElement.dispatchEvent(customEvent);
						}
					} catch (err) {
						_didIteratorError = true;
						_iteratorError = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion && _iterator.return) {
								_iterator.return();
							}
						} finally {
							if (_didIteratorError) {
								throw _iteratorError;
							}
						}
					}

					break;

				case WXREvent.AR_TARGET_DETECTED:
					customEvent = new CustomEvent(WXREvent.AR_TARGET_DETECTED, { detail: event });

					var _iteratorNormalCompletion2 = true;
					var _didIteratorError2 = false;
					var _iteratorError2 = undefined;

					try {
						for (var _iterator2 = $(WXRTarget.is)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
							var targetDOMElement = _step2.value;

							if (this.getRemoveProtocolPath(targetDOMElement.src) === this.getRemoveProtocolPath(event.target)) {
								targetDOMElement.dispatchEvent(customEvent);
							}
						}
					} catch (err) {
						_didIteratorError2 = true;
						_iteratorError2 = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion2 && _iterator2.return) {
								_iterator2.return();
							}
						} finally {
							if (_didIteratorError2) {
								throw _iteratorError2;
							}
						}
					}

					break;

				case WXREvent.AR_TARGET_MOVED:
					customEvent = new CustomEvent(WXREvent.AR_TARGET_MOVED, { detail: event });

					var _iteratorNormalCompletion3 = true;
					var _didIteratorError3 = false;
					var _iteratorError3 = undefined;

					try {
						for (var _iterator3 = $(WXRTarget.is)[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
							var _targetDOMElement = _step3.value;

							if (this.getRemoveProtocolPath(_targetDOMElement.src) === this.getRemoveProtocolPath(event.target)) {
								_targetDOMElement.dispatchEvent(customEvent);
							}
						}
					} catch (err) {
						_didIteratorError3 = true;
						_iteratorError3 = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion3 && _iterator3.return) {
								_iterator3.return();
							}
						} finally {
							if (_didIteratorError3) {
								throw _iteratorError3;
							}
						}
					}

					break;

				case WXREvent.AR_TARGET_MISSED:
					customEvent = new CustomEvent(WXREvent.AR_TARGET_MISSED, { detail: event.target });

					var _iteratorNormalCompletion4 = true;
					var _didIteratorError4 = false;
					var _iteratorError4 = undefined;

					try {
						for (var _iterator4 = $(WXRTarget.is)[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
							var _targetDOMElement2 = _step4.value;

							if (this.getRemoveProtocolPath(_targetDOMElement2.src) === this.getRemoveProtocolPath(event.target)) {
								_targetDOMElement2.dispatchEvent(customEvent);
							}
						}
					} catch (err) {
						_didIteratorError4 = true;
						_iteratorError4 = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion4 && _iterator4.return) {
								_iterator4.return();
							}
						} finally {
							if (_didIteratorError4) {
								throw _iteratorError4;
							}
						}
					}

					break;

				case WXREvent.SPACE_CHECKIN:
					customEvent = new CustomEvent(WXREvent.SPACE_CHECKIN, { detail: event });
					event.target.dispatchEvent(customEvent);

					break;

				case WXREvent.SPACE_CHECKOUT:
					customEvent = new CustomEvent(WXREvent.SPACE_CHECKOUT, { detail: event });
					event.target.dispatchEvent(customEvent);

					break;

				case WXREvent.BEACON_DETECTED:
					var _iteratorNormalCompletion5 = true;
					var _didIteratorError5 = false;
					var _iteratorError5 = undefined;

					try {
						for (var _iterator5 = $('[src=\'' + event.beacon + '\']')[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
							var domElement = _step5.value;

							WXR.SpaceManager.enterSpace(domElement);
						}
					} catch (err) {
						_didIteratorError5 = true;
						_iteratorError5 = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion5 && _iterator5.return) {
								_iterator5.return();
							}
						} finally {
							if (_didIteratorError5) {
								throw _iteratorError5;
							}
						}
					}

					break;

				case WXREvent.BEACON_MISSED:
					var _iteratorNormalCompletion6 = true;
					var _didIteratorError6 = false;
					var _iteratorError6 = undefined;

					try {
						for (var _iterator6 = $('[src=\'' + event.beacon + '\']')[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
							var _domElement = _step6.value;

							WXR.SpaceManager.exitSpace(_domElement);
						}
					} catch (err) {
						_didIteratorError6 = true;
						_iteratorError6 = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion6 && _iterator6.return) {
								_iterator6.return();
							}
						} finally {
							if (_didIteratorError6) {
								throw _iteratorError6;
							}
						}
					}

					break;

				case WXREvent.GEOMETRY_ON_MOUSE_DOWN:
					var mouseEvent = document.createEvent('MouseEvents');
					mouseEvent.initMouseEvent(WXREvent.GEOMETRY_ON_CLICK, event.params.canBubble, event.params.cancelable, event.params.view, event.params.detail, event.params.screenX, event.params.screenY, event.params.clientX, event.params.clientY, event.params.ctrlKey, event.params.altKey, event.params.shiftKey, event.params.metaKey, event.params.button, event.params.relatedTarget);

					mouseEvent.vectorX = event.params.vectorX;
					mouseEvent.vectorY = event.params.vectorY;
					mouseEvent.vectorZ = event.params.vectorZ;

					this.traverseDomBottomUp(event.target, function (domElement) {
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
								vectorX: event.params.vectorX,
								vectorY: event.params.vectorY,
								vectorZ: event.params.vectorZ
							},
							part: event.part
						}
					});

					this.traverseDomBottomUp(event.target, function (domElement) {
						domElement.dispatchEvent(customEvent);
					});

					break;

				case WXREvent.TARGET_ABAILABLE:
					this.traverseDOMTopDown(event.target, function (domElement) {
						customEvent = new CustomEvent(event.type, {});
						domElement.dispatchEvent(customEvent);
					});
					break;

				default:
					break;
			}
		}
	}, {
		key: 'traverseDomBottomUp',
		value: function traverseDomBottomUp(domElement, callback) {
			callback(domElement);

			if (!domElement.tagName.toLocaleLowerCase().startsWith(WXRWorld.is)) {
				this.traverseDomBottomUp(domElement.parentElement, callback);
			}
		}
	}, {
		key: 'traverseDOMTopDown',
		value: function traverseDOMTopDown(domElement, callback) {
			callback(domElement);

			if (domElement.children.length > 0) {
				var _iteratorNormalCompletion7 = true;
				var _didIteratorError7 = false;
				var _iteratorError7 = undefined;

				try {
					for (var _iterator7 = domElement.children[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
						var dom = _step7.value;

						this.traverseDOMTopDown(dom, callback);
					}
				} catch (err) {
					_didIteratorError7 = true;
					_iteratorError7 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion7 && _iterator7.return) {
							_iterator7.return();
						}
					} finally {
						if (_didIteratorError7) {
							throw _iteratorError7;
						}
					}
				}
			}
		}
	}, {
		key: 'getRemoveProtocolPath',
		value: function getRemoveProtocolPath(url) {
			return url.slice(url.indexOf("//" + 2, url.length));
		}
	}]);

	return WXREvent;
}();

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

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var WXREventUI = function () {
	function WXREventUI() {
		_classCallCheck(this, WXREventUI);
	}

	_createClass(WXREventUI, null, [{
		key: 'dispatchEvent',
		value: function dispatchEvent(event) {
			var customEvent = void 0;

			switch (event.type) {
				case WXREventUI.MODE_CHANGED_AR:
					this.targetClear();

					if (WXR.ARTrackerEngine !== undefined) {
						WXR.ARTrackerEngine.changeModeAR();
					} else {
						WXR.log(WXREventUI.LOGTAG, "not available ARTrackerEngine");
					}

					document.body.style.backgroundColor = 'rgba(255, 255, 255, 0)';

					var _iteratorNormalCompletion = true;
					var _didIteratorError = false;
					var _iteratorError = undefined;

					try {
						for (var _iterator = $(WXRSpace.is)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
							var spaceDomElement = _step.value;
							var _iteratorNormalCompletion2 = true;
							var _didIteratorError2 = false;
							var _iteratorError2 = undefined;

							try {
								for (var _iterator2 = spaceDomElement.children[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
									var targetDomElement = _step2.value;

									targetDomElement.style.display = "none";
								}
							} catch (err) {
								_didIteratorError2 = true;
								_iteratorError2 = err;
							} finally {
								try {
									if (!_iteratorNormalCompletion2 && _iterator2.return) {
										_iterator2.return();
									}
								} finally {
									if (_didIteratorError2) {
										throw _iteratorError2;
									}
								}
							}
						}
					} catch (err) {
						_didIteratorError = true;
						_iteratorError = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion && _iterator.return) {
								_iterator.return();
							}
						} finally {
							if (_didIteratorError) {
								throw _iteratorError;
							}
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

					var _iteratorNormalCompletion3 = true;
					var _didIteratorError3 = false;
					var _iteratorError3 = undefined;

					try {
						for (var _iterator3 = $(WXRSpace.is)[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
							var _spaceDomElement = _step3.value;

							if (_spaceDomElement.enable === true) {
								var _iteratorNormalCompletion4 = true;
								var _didIteratorError4 = false;
								var _iteratorError4 = undefined;

								try {
									for (var _iterator4 = _spaceDomElement.children[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
										var _targetDomElement = _step4.value;

										if (_targetDomElement.tagName.toLowerCase() === WXRTarget.is) {
											_targetDomElement.style.display = "block";
											WXREvent.dispatchEvent({ type: WXREvent.TARGET_ABAILABLE, target: _targetDomElement });
										}
									}
								} catch (err) {
									_didIteratorError4 = true;
									_iteratorError4 = err;
								} finally {
									try {
										if (!_iteratorNormalCompletion4 && _iterator4.return) {
											_iterator4.return();
										}
									} finally {
										if (_didIteratorError4) {
											throw _iteratorError4;
										}
									}
								}
							}
						}
					} catch (err) {
						_didIteratorError3 = true;
						_iteratorError3 = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion3 && _iterator3.return) {
								_iterator3.return();
							}
						} finally {
							if (_didIteratorError3) {
								throw _iteratorError3;
							}
						}
					}

					WXR.WebVR.exitWebVR();

					$(WXRDebugUI.is).show();
					$(WXRLayerUI.is).show();
					$(WXRSliderUI.is).show();

					if ($(WXRCamera.is).length > 0) {
						var cameraDomElement = $(WXRCamera.is)[0];

						WXREvent.dispatchEvent({ type: WXREvent.CAMERA_READY, camera: {
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

					var _iteratorNormalCompletion5 = true;
					var _didIteratorError5 = false;
					var _iteratorError5 = undefined;

					try {
						for (var _iterator5 = $(WXRSpace.is)[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
							var _spaceDomElement2 = _step5.value;

							if (_spaceDomElement2.enable === true) {
								var _iteratorNormalCompletion6 = true;
								var _didIteratorError6 = false;
								var _iteratorError6 = undefined;

								try {
									for (var _iterator6 = _spaceDomElement2.children[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
										var _targetDomElement2 = _step6.value;

										if (_targetDomElement2.tagName.toLowerCase() === WXRTarget.is) {
											_targetDomElement2.style.display = "block";
											WXREvent.dispatchEvent({ type: WXREvent.TARGET_ABAILABLE, target: _targetDomElement2 });
										}
									}
								} catch (err) {
									_didIteratorError6 = true;
									_iteratorError6 = err;
								} finally {
									try {
										if (!_iteratorNormalCompletion6 && _iterator6.return) {
											_iterator6.return();
										}
									} finally {
										if (_didIteratorError6) {
											throw _iteratorError6;
										}
									}
								}
							}
						}
					} catch (err) {
						_didIteratorError5 = true;
						_iteratorError5 = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion5 && _iterator5.return) {
								_iterator5.return();
							}
						} finally {
							if (_didIteratorError5) {
								throw _iteratorError5;
							}
						}
					}

					if ($(WXRCamera.is).length > 0) {
						var _cameraDomElement = $(WXRCamera.is)[0];

						WXREvent.dispatchEvent({ type: WXREvent.CAMERA_READY, camera: {
								fovy: _cameraDomElement.fovy,
								aspect: _cameraDomElement.aspect,
								near: _cameraDomElement.near,
								far: _cameraDomElement.far
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
	}, {
		key: 'targetClear',
		value: function targetClear() {
			TWEEN.removeAll();

			var _iteratorNormalCompletion7 = true;
			var _didIteratorError7 = false;
			var _iteratorError7 = undefined;

			try {
				for (var _iterator7 = $(WXRTarget.is)[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
					var targetDomElement = _step7.value;

					targetDomElement.clearObject3D();
				}
			} catch (err) {
				_didIteratorError7 = true;
				_iteratorError7 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion7 && _iterator7.return) {
						_iterator7.return();
					}
				} finally {
					if (_didIteratorError7) {
						throw _iteratorError7;
					}
				}
			}
		}
	}]);

	return WXREventUI;
}();

WXREventUI.MODE_CHANGED_3D = "3DModeChanged";
WXREventUI.MODE_CHANGED_AR = "ARModeChanged";
WXREventUI.MODE_CHANGED_VR = "VRModeChanged";
WXREventUI.LOGTAG = "WXREventUI";

module.exports = WXREventUI;

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var WXREventDevice = function () {
	function WXREventDevice() {
		_classCallCheck(this, WXREventDevice);
	}

	_createClass(WXREventDevice, null, [{
		key: 'dispatchEvent',
		value: function dispatchEvent(event) {
			var customEvent = void 0;

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
					customEvent = new CustomEvent(WXREventDevice.HANDGESTURE_DETECTED, { detail: event.detail });

					if ($('#' + event.id)) {
						$('#' + event.id).dispatchEvent(customEvent);
					}

					break;

				case WXREventDevice.HANDGESTURE_MOVED:
					customEvent = new CustomEvent(WXREventDevice.HANDGESTURE_MOVED, { detail: event.detail });

					if ($('#' + event.id)) {
						$('#' + event.id).dispatchEvent(customEvent);
					}

					break;

				case WXREventDevice.HANDGESTURE_MISSED:
					customEvent = new CustomEvent(WXREventDevice.HANDGESTURE_MISSED, { detail: event.detail });

					if ($('#' + event.id)) {
						$('#' + event.id).dispatchEvent(customEvent);
					}

					break;

				default:
					break;
			}
		}
	}]);

	return WXREventDevice;
}();

WXREventDevice.HANDGESTURE_DETECTED = 'HandGestureDetected';
WXREventDevice.HANDGESTURE_MOVED = 'HandGestureMoved';
WXREventDevice.HANDGESTURE_MISSED = 'HandGestureMissed';

module.exports = WXREventDevice;

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var WXRWebVR = function () {
	function WXRWebVR() {
		_classCallCheck(this, WXRWebVR);
	}

	_createClass(WXRWebVR, [{
		key: "exitWebVR",
		value: function exitWebVR() {
			if ($(WXRWorld.is)[0].renderer !== undefined) {
				$(WXRWorld.is)[0].renderer.exitVR();
			}
		}
	}, {
		key: "enterWebVR",
		value: function enterWebVR() {
			if ($(WXRWorld.is)[0].renderer !== undefined) {
				$(WXRWorld.is)[0].renderer.enterVR();
			}
		}
	}]);

	return WXRWebVR;
}();

WXRWebVR.TAG = "WXRWebVR";

module.exports = WXRWebVR;

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var WXRSensor = function () {
	function WXRSensor() {
		_classCallCheck(this, WXRSensor);

		this.callback = {};
	}

	_createClass(WXRSensor, [{
		key: 'generateUUID',
		value: function generateUUID() {
			var UUID = THREE.Math.generateUUID();

			return UUID;
		}
	}, {
		key: 'getCurrentBeacons',
		value: function getCurrentBeacons(callback, options) {
			var _this = this;

			var callbackId = this.generateUUID();

			// store callback function.
			this.callback[callbackId] = function () {
				for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
					args[_key] = arguments[_key];
				}

				// parse string as array of beacons list.
				args[0] = args[0].slice(1, -1).split(', ');
				args[1] = args[1] === "null" ? null : args[1];

				// Function.prototype.apply(thisArg, [argsArray])
				callback.apply(null, args);

				// delete callback function
				delete _this.callback[callbackId];
			};

			// callbackId has to be String.
			WXR.SensorManager.getCurrentBeacons(callbackId, null);

			return;
		}

		// EventType: watch, appear, disappear

	}, {
		key: 'addEventListener',
		value: function addEventListener(eventName, listenerTarget, callback, options) {
			listenerTarget = listenerTarget || [];
			options = options || {};

			// eventListenerId is exactly same with callbackId, but this division is needed for semantics.
			var callbackId = this.generateUUID();
			var eventListenerId = callbackId;

			// store callback function.
			this.callback[callbackId] = function () {
				for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
					args[_key2] = arguments[_key2];
				}

				// parse string as array of beacons list.
				args[0] = args[0].slice(1, -1).split(', ');
				args[1] = args[1] === "null" ? null : args[1];

				// Function.prototype.apply(thisArg, [argsArray])
				callback.apply(null, args);
			};

			WXR.SensorManager.addEventListener(eventName, JSON.stringify(listenerTarget), callbackId, JSON.stringify(options));

			return eventListenerId;
		}
	}, {
		key: 'removeEventListener',
		value: function removeEventListener(eventListenerId) {
			WXR.SensorManager.removeEventListener(eventListenerId);

			// delete callback function
			var callbackId = eventListenerId;
			delete this.callback[callbackId];

			return;
		}
	}]);

	return WXRSensor;
}();

module.exports = WXRSensor;

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var WXRSpaceManager = function () {
	function WXRSpaceManager() {
		_classCallCheck(this, WXRSpaceManager);
	}

	_createClass(WXRSpaceManager, [{
		key: 'addTargets',
		value: function addTargets(data) {
			WXR.ARTrackerEngine.loadTargets(JSON.stringify(data));
		}
	}, {
		key: 'unloadTargets',
		value: function unloadTargets(data) {
			WXR.ARTrackerEngine.unloadTargets(JSON.stringify(data));
		}
	}, {
		key: 'enterSpace',
		value: function enterSpace(domElement) {
			WXREvent.dispatchEvent({ type: WXREvent.SPACE_CHECKIN, target: domElement });
		}
	}, {
		key: 'exitSpace',
		value: function exitSpace(domElement) {
			WXREvent.dispatchEvent({ type: WXREvent.SPACE_CHECKOUT, target: domElement });
		}
	}, {
		key: 'changeHtml',
		value: function changeHtml(url) {
			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = $('[enable=true]')[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var sceneDom = _step.value;
					var _iteratorNormalCompletion2 = true;
					var _didIteratorError2 = false;
					var _iteratorError2 = undefined;

					try {
						for (var _iterator2 = sceneDom.children[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
							var targetDom = _step2.value;

							targetDom.disconnectedCallback();
						}
					} catch (err) {
						_didIteratorError2 = true;
						_iteratorError2 = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion2 && _iterator2.return) {
								_iterator2.return();
							}
						} finally {
							if (_didIteratorError2) {
								throw _iteratorError2;
							}
						}
					}
				}
			} catch (err) {
				_didIteratorError = true;
				_iteratorError = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion && _iterator.return) {
						_iterator.return();
					}
				} finally {
					if (_didIteratorError) {
						throw _iteratorError;
					}
				}
			}

			WXR.ARTrackerEngine.onHtmlChange(url);
		}
	}]);

	return WXRSpaceManager;
}();

module.exports = WXRSpaceManager;

/***/ }),
/* 14 */
/***/ (function(module, exports) {

THREE.LookControls = function(camera, domElement) {

	let scope = this;
	let isFront = false;

	this.domElement = (domElement !== undefined) ? domElement : document;
	this.enabled = true;

	let verticalLimit = true;

	camera.rotation.set( 0, 0, 0 );

	let PI_2 = Math.PI / 2;

	let onMouseDown = function ( event ) {
		scope.isMouseDown = true;
	}

	let onMouseUp = function ( event ) {
		scope.isMouseDown = false;
	}

	let onMouseMove = function ( event ) {

		if ( scope.enabled === false ) return;
		if ( !scope.isMouseDown ) return;

		let movementX = event.movementX;
		let movementY = event.movementY;

		let y = camera.rotation.y;

		if(y > 6.28 ) camera.rotation.y -= 6.28;
		if(y < -6.28) camera.rotation.y += 6.28;

		if(y>-1.57 && y<1.57) isFront = true;
		else if(y>1.57 && y<4.71) isFront = false;
		else if(y<-1.57 && y>-4.71) isFront = false;
		else if(y>4.71) isFront = true;
		else if(y<-4.71) isFront = true;

		camera.rotation.y -= movementX * 0.002;

		if(!verticalLimit) {
			if(isFront) {
				camera.rotation.x -= movementY * 0.002;
			} else {
				camera.rotation.x -= movementY * 0.002 * -1;
			}
		}

		camera.rotation.x = Math.max( - PI_2, Math.min( PI_2, camera.rotation.x ) );
	};

	this.dispose = function() {

		this.domElement.removeEventListener( 'mousemove', onMouseMove, false );
		this.domElement.removeEventListener( 'mousedown', onMouseDown, false );
		this.domElement.removeEventListener( 'mouseup', onMouseUp, false );

	};

	this.domElement.addEventListener( 'mousemove', onMouseMove, false );
	this.domElement.addEventListener( 'mousedown', onMouseDown, false );
	this.domElement.addEventListener( 'mouseup', onMouseUp, false );
}

module.exports = THREE.LookControls;


/***/ }),
/* 15 */
/***/ (function(module, exports) {

THREE.KeyboardControls = function(camera) {
	let scope = this;

	let moveForward = false;
	let moveBackward = false;
	let moveLeft = false;
	let moveRight = false;

	let prevTime = performance.now();
	let velocity = new THREE.Vector3();
	let direction = new THREE.Vector3();

	scope.yLimit = camera.position.y;
	scope.controlsEnabled = true;

	let onKeyDown = function ( event ) {

		switch ( event.keyCode ) {

			case 38: // up
			case 87: // w
				moveForward = true;
				break;

			case 37: // left
			case 65: // a
				moveLeft = true; break;

			case 40: // down
			case 83: // s
				moveBackward = true;
				break;

			case 39: // right
			case 68: // d
				moveRight = true;
				break;

		}

	};

	let onKeyUp = function ( event ) {

		switch( event.keyCode ) {

			case 38: // up
			case 87: // w
				moveForward = false;
				break;

			case 37: // left
			case 65: // a
				moveLeft = false;
				break;

			case 40: // down
			case 83: // s
				moveBackward = false;
				break;

			case 39: // right
			case 68: // d
				moveRight = false;
				break;

		}

	};
	document.addEventListener( 'keydown', onKeyDown, false );
	document.addEventListener( 'keyup', onKeyUp, false );

	let raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10 );

	this.update = function() {
		if ( scope.controlsEnabled === true ) {

			raycaster.ray.origin.copy( camera.position );
			raycaster.ray.origin.y -= 10;

			var time = performance.now();
			var delta = ( time - prevTime ) / 1000;

			velocity.x -= velocity.x * 30.0 * delta;
			velocity.z -= velocity.z * 30.0 * delta;

			direction.z = Number( moveForward ) - Number( moveBackward );
			direction.x = Number( moveLeft ) - Number( moveRight );
			direction.normalize(); // this ensures consistent movements in all directions

			if ( moveForward || moveBackward ) velocity.z -= direction.z * 400.0 * delta;
			if ( moveLeft || moveRight ) velocity.x -= direction.x * 400.0 * delta;

			camera.translateX( velocity.x * delta );
			camera.translateZ( velocity.z * delta );
			camera.position.y = scope.yLimit;

			prevTime = time;
		}
	}
}

module.exports = THREE.KeyboardControls;


/***/ }),
/* 16 */
/***/ (function(module, exports) {

THREE.WXRRenderer = function (opts) {
	console.log('THREE.WXRRenderer', WXR.REVISION);
	
	this.type = 'WXRRenderer';
	
	var autoUpdateObjects = true;
	var glCamera = null;
	var cssCamera = null;
	
	var glScene = new THREE.Scene();
	var cssScene = new THREE.Scene();
	var cssFactor = 1000;
	
	var glRenderer = new THREE.WebGLRenderer({alpha: true, antialias: true});
	
	if (opts !== undefined) {
		glRenderer.setClearColor((opts.clearColor !== undefined ) ? opts.clearColor : 0x000000);
	} else {
		glRenderer.setClearColor(0x000000, 0);
	}
	
	glRenderer.setSize(window.innerWidth, window.innerHeight);
	glRenderer.domElement.style.pointerEvents = 'none';
	glRenderer.domElement.style.position = 'absolute';
	glRenderer.domElement.style.top = '0px';
	glRenderer.domElement.style.width = '100%';
	glRenderer.domElement.style.height = '100%';
	glRenderer.domElement.style.zIndex= -3;
	
	var cssRenderer = new THREE.CSS3DRenderer();
	cssRenderer.setSize(window.innerWidth, window.innerHeight);
	cssRenderer.domElement.style.position = 'absolute';
	cssRenderer.domElement.style.top = 0;
	cssRenderer.domElement.style.width = '100%';
	cssRenderer.domElement.style.height = '100%';
	cssRenderer.domElement.style.zIndex = -2;
	document.body.appendChild(cssRenderer.domElement);
	
	cssRenderer.domElement.appendChild(glRenderer.domElement);

	/////////////////////////////////////////////////////////////

	let webVRButton = WEBVR.createButton( glRenderer );
	let triggerEvent = document.createEvent('MouseEvents');
	triggerEvent.initMouseEvent('click');

	/////////////////////////////////////////////////////////////

	this.setCamera = function (camera) {
		glCamera = camera;
		
		cssCamera = new THREE.PerspectiveCamera(camera.fov, camera.aspect,
			camera.near, camera.far);

		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		
		window.addEventListener('resize', this.onWindowResize, false);
	};

	this.onWindowResize = function (e) {
		glCamera.aspect = window.innerWidth / window.innerHeight;
		glCamera.updateProjectionMatrix();

		glRenderer.setSize(window.innerWidth, window.innerHeight);
	}

	this.render = function () {
		glRenderer.animate(this.update.bind(this));
	}
	
	this.update = function () {
		if (glCamera !== null) {
			cssCamera.quaternion.copy(glCamera.quaternion);
			cssCamera.position.copy(glCamera.position);
			
			if (autoUpdateObjects !== true) {
				return;
			}
			
			cssScene.traverse(function (cssObject) {
				if (cssObject instanceof THREE.Scene === true) {
					return;
				}
				
				/*
				var vrobject = cssObject.userData.VRobject;

				if (vrobject === undefined) {
					return;
				}

				vrobject.update();
				*/
			});
			
			cssRenderer.render(cssScene, cssCamera);
			glRenderer.render(glScene, glCamera);
			TWEEN.update();
		}
	};
	
	this.getWebGLRenderer = function () {
		return glRenderer;
	};
	
	this.getCSS3DRenderer = function () {
		return cssRenderer;
	};
	
	this.getWebGLScene = function () {
		return glScene;
	};
	
	this.getCSS3DScene = function () {
		return cssScene;
	};
	
	this.getCSSFactor = function () {
		return cssFactor;
	};
	
	this.getWebGLCamera = function () {
		return glCamera;
	}
	
	this.getCSS3DCamera = function () {
		return cssCamera;
	}
	
	this.getTargetWebGLObjects = function () {
		let targetWebGLObjects = [];
		
		for (let child of glScene.children) {
			if (child.constructor !== THREE.TransformControls && child.visible === true) {
				child.traverse(object => {
					targetWebGLObjects.push(object);
				});
			}
		}
		
		return targetWebGLObjects;
	}

	this.enterVR = function() {
		if(webVRButton.innerHTML === "ENTER VR") {
			glRenderer.vr.enabled = true;
			webVRButton.dispatchEvent(triggerEvent);
		}
	}

	this.exitVR = function() {
		if(webVRButton.innerHTML === "EXIT VR") {
			glRenderer.vr.enabled = false;
			webVRButton.dispatchEvent(triggerEvent);
		}
	}

}

module.exports = THREE.WXRRenderer;


/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

THREE.WXRRenderer = __webpack_require__(16);
THREE.wasdControls = __webpack_require__(15);
THREE.LookControls = __webpack_require__(14);

window.WXRSpaceManager = __webpack_require__(13);
window.WXRSensor = __webpack_require__(12);
window.WXRWebVR = __webpack_require__(11);
window.WXREventDevice = __webpack_require__(10);
window.WXREventUI = __webpack_require__(9);
window.WXREvent = __webpack_require__(8);
window.WXRLocationManager = __webpack_require__(7);
window.WXRDevice = __webpack_require__(6);
window.WXRContextManager = __webpack_require__(5);
window.WXRARTrackerListener = __webpack_require__(4);
window.WXRWebizingDeviceConfigManager = __webpack_require__(3);
window.WXRInteractionListener = __webpack_require__(2);
window.WXR = __webpack_require__(0).WXR;
window.WXRClass = __webpack_require__(0).WXRClass;

__webpack_require__(1);

/***/ })
/******/ ]);