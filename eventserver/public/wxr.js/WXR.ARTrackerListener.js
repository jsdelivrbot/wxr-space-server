'use strict';

class WXRARTrackerListener {
	constructor() {
	}
	
	onCameraReady(cameraProjectionMatrix) {
		let projection = this.calcProjection(cameraProjectionMatrix, "portrait");
		
		let cameraParams = {
			fovy: projection.fovy,
			aspect: window.innerWidth / window.innerHeight,
			near: projection.near,
			far: projection.far
		};
		
		WXREvent.dispatchEvent({type: WXREvent.CAMERA_READY, camera: cameraParams});
	}
	
	onTargetLoaded(urlTarget) {
	}
	
	onTargetDetected(targetURL, targetType, targetSize) {
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
	
	onTargetMoved(targetURL, modelViewMatrix) {
		let matrix4 = new THREE.Matrix4();
		matrix4.elements = modelViewMatrix;

		WXREvent.dispatchEvent({
			type: WXREvent.AR_TARGET_MOVED,
			target: targetURL,
			transform: matrix4
		});
	}
	
	onTargetMissed(targetURL) {
		WXREvent.dispatchEvent({
			type: WXREvent.AR_TARGET_MISSED,
			target: targetURL,
		});
	}
	
	calcProjection(matrix) {
		let fovy = (2 * Math.atan(1 / -matrix[1])) * (180 / Math.PI);
		let r = matrix[1] / matrix[4];
		let n = matrix[14] / (-matrix[10] - 1);
		let f = matrix[14] / (-matrix[10] + 1);
		
		return {
			fovy: fovy,
			ratio: r,
			near: n,
			far: f
		};
	}
	
	getDistanceFromXYZ(x, y, z) {
		let distance = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2) + Math.pow(z, 2));
		
		return distance;
	}
}

module.exports = WXRARTrackerListener;
