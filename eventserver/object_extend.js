var crypto = require('crypto');

// hash shortcut
String.prototype.hash = function(salt) {
	salt = salt || 'eventserver-socketio';
	let hash = crypto.createHash('sha512');
	hash.update(this.valueOf());
	hash.update(salt);
	return hash.digest('base64');
}

// array union method
Array.prototype.union = function(target) {
	return [...new Set([...this, ...target])];
}