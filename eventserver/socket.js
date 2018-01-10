


module.exports = function(http) {
	
	var io = require('socket.io')(http);
	var redis = require('redis');
	var client = redis.createClient();
	
	
	io.on('connection', function(socket){
	  	console.log('a user connected');


	  	// device_uuid variable
	  	let device_uuid = '';
		socket.on('vrpn_event', function(msg) {

            if (msg.event === 'optitrack_server_on') {
                const remote_address = socket.request.connection.remoteAddress.split(':')[3];
                const server_name = msg.detail.server_name || 'noname';

                // device_uuid: ip@server_name
                device_uuid = remote_address + '@' + server_name;
            } else {
                // TODO: publish the msg to authorized client


            }

            // save all msg in redis DB
            save_in_redis(msg);
        });

		socket.on('disconnect', function() {
			/*
			 * save optitrack_server_off event manually in event server
			 * due to detecting websocket disconnected is only possible by event server
			 *
			 * { event: 'optitrack_server_off',
			 *   detail: { server_name: 'dummy_server' } }
			 */

			let msg = {
				event: 'optitrack_server_off',
				detail: { }
			}
            save_in_redis(msg);

            console.log('user is disconnected');
		});



		// save obj data to redis
		function save_in_redis(obj) {
			// copy obj
			var o = Object.assign({}, obj);

            // This is converted to "[object Object]" by using .toString() now and will return an error from v.3.0 on.
            //     Please handle this in your code to make sure everything works as you intended it to.
			for (let key in o) {
				o[key].toString();
				if (o[key].toString() === '[object Object]') {
					o[key] = JSON.stringify(o[key]);
                }
            }

            // has_key: Event:device_uuid:timestamp
            if (device_uuid.length !== 0) {
                const hash_key = 'event:' + device_uuid + ':' + Date.now();
                client.hmset(hash_key, o);

                console.log(`saved ${hash_key}`);
            }
		}
	});
	
	return io;
}
