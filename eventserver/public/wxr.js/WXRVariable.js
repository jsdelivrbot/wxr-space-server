'use strict';
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
switch(platform.os.family) {
	case WXR.Platform.Android:
		WXR.ARTrackerEngine = window.WXRARTrackerEngine;
		WXR.SensorManager = window.WXRSensorManager;
		WXR.Setting = window.WXRSetting;
		WXR.TargetManager = window.WXRTargetManager;
		break;

	case WXR.Platform.iOS:
		WXR.ARTrackerEngine = {};
		WXR.ARTrackerEngine.loadTarget = function(data) {
			window.webkit.messageHandlers.loadTargets.postMessage(data);
		}
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

