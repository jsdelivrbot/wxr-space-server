window.addEventListener('keydown', e=> {
	if(e.key === '1') {
		$(WXRTarget.is)[0].style.display = "block";

	}
	if(e.key === '2') {
		$(WXRTarget.is)[0].style.display = "none";

	}
});

/* layer에 Shadow DOM외부에서 item list를 추가하는 script
document.querySelector('wxr-layer').layerItemAdd('./images/layer/layer5.png', 'WXRLayerItem5'); */
