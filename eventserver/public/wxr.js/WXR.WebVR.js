'use strict';

class WXRWebVR {

	exitWebVR() {
		if($(WXRWorld.is)[0].renderer !== undefined) {
			$(WXRWorld.is)[0].renderer.exitVR();
		}
	}

	enterWebVR() {
		if($(WXRWorld.is)[0].renderer !== undefined) {
			$(WXRWorld.is)[0].renderer.enterVR();
		}
	}

}

WXRWebVR.TAG = "WXRWebVR";

module.exports = WXRWebVR;
