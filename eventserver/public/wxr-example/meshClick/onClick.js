function onCylinderClick(e) {
	console.log("wxr-cylinder : " + e.type, e);
}

function onTargetClick(e) {
	console.log("wxr-target : " + e.type, e);
}
//
// function onSpaceClick(e) {
// 	console.log(e.type, e);
// }
//
// function onWorldClick(e) {
// 	console.log(e.type, e);
// }

window.addEventListener('WebComponentsReady', function() {
	$('wxr-target')[0].addEventListener('WXRARTargetDetected', onTargetDetected);
	$('wxr-target')[0].addEventListener('WXRARTargetMissed', onTargetMissed);
});

function onTargetDetected(e) {
	console.log(e);
}
function onTargetMissed(e) {
	console.log(e);
}