

window.onload = function() {
    var socket = io();
	console.log('connect');
	socket.on('categories', function(msg) {
		console.log(msg);
	});
}
