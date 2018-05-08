'use strict';

let WXR = {REVISION: '0.3-dev-three.r90'};
let WXRClass = {};

if (typeof define === 'function' && define.amd) {
	define('wxrlib', WXR);
} else if ('undefined' !== typeof exports && 'undefined' !== typeof module) {
	module.exports = WXR;
}

WXR.PREFIX_WXR = "WXR-";
WXR.debug = false;

WXR.log = function(tag, msg) {
	if( WXR.debug === true)  {
		console.log(tag);
		console.log(msg);
	}
}

WXR.log('WXR', WXR.REVISION);

module.exports = { WXR, WXRClass };