const TAG = "transform";

function modelClicked(event) {
	console.log(TAG, event);
	$(WXRWorld.is)[0].transformControls.attach(event.target.webGLObject3D);
}
