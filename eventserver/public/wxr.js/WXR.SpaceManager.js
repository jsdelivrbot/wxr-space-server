'use strict';

class WXRSpaceManager {
	constructor() {

	}

	addTargets(data) {
		WXR.ARTrackerEngine.loadTargets(JSON.stringify(data));
	}

	unloadTargets(data) {
		WXR.ARTrackerEngine.unloadTargets(JSON.stringify(data));
	}

	enterSpace(domElement) {
		WXREvent.dispatchEvent({type: WXREvent.SPACE_CHECKIN, target: domElement});
	}

	exitSpace(domElement) {
		WXREvent.dispatchEvent({type: WXREvent.SPACE_CHECKOUT, target: domElement});
	}

	changeHtml(url) {
		for (let sceneDom of $('[enable=true]')) {
			for (let targetDom of sceneDom.children) {
				targetDom.disconnectedCallback();
			}
		}
		WXR.ARTrackerEngine.onHtmlChange(url);
	}
}

module.exports = WXRSpaceManager;
