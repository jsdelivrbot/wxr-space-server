


module.exports = function(http) {
	
	var io = require('socket.io')(http);
	
	
	io.on('connection', function(socket){
	  	console.log('a user connected');
		
		socket.on('categories', function(cat) {
			io.emit('categories', cat);
		});
	});
	
	return io;
}
