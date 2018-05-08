function clickValve(event) {
	// console.log(event.detail.part);

	if(event.detail.part === "PipeValvehandle_267"
		|| event.detail.part === "PipeValvehandle_60"
	) {
		let object = event.target.webGLObject3D.getObjectByName(event.detail.part);

		let center = object.geometry.center(); // 0, 0, 0으로 이동됨

		object.rotateZ(0.3);
		object.position.sub(center);
	}
}
function clickPrinter(event) {
	if($("#annotation1")[0].style.display === "none") {
		$("#annotation1")[0].style.display = "block";
		$("#annotation2")[0].style.display = "block";
	} else {
		$("#annotation1")[0].style.display = "none";
		$("#annotation2")[0].style.display = "none";
	}
}

$(function() {
	let domElements = $(WXRHTML.is);

	for(let element of domElements) {
		element.style.display= "none";
	}
});