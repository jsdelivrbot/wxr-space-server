


module.exports = function(passportAuthorize) {

  var config = require('config');
  var io = require('socket.io')(config.get('SocketIO.port'));
  var redis = require('redis');
  var client = redis.createClient();
  
  

  // To get session of passport in socket logic, use passport.socketio middleware.
  io.use(passportAuthorize);

  io.on('connection', function(socket){

    // device_uuid variable
    let device_uuid = '';
    socket.on('vrpn_event', function(msg) {

      if (!msg || !msg.event || !msg.detail) {
        console.error(`invalid msg!`);
        return ;
      }

      // Q: If timestamp is invalid, throw away it? Or create new one in event server?
      // A message that has invalid timestamp will be dropped.
      let timestamp = msg.detail.timestamp;
      if (!timestamp) {
        return;
      }

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
       * < message structure >
       * { event: 'optitrack_server_off',
       *   detail: {
       *     timestamp: timestamp,
       *     server_name: 'dummy_server' } }
       */

      let msg = {
        event: 'optitrack_server_off',
        detail: {
          timestamp: Date.now()
        }
      }
      save_in_redis(msg);

      console.log('user is disconnected');
    });



    // save obj data to redis
    function save_in_redis(obj) {
      // copy obj
      var o = Object.assign({}, obj);

      // hmset(key, obj) method do convert each key and value to string by using .toString().
      // and the method will return an error when a value that is converted to "[object Object]" exist.
      // so stringify o.detail value by using JSON.stringify
      for (let key in o) {
        o[key].toString();
        if (o[key].toString() === '[object Object]') {
          o[key] = JSON.stringify(o[key]);
        }
      }

      // has_key: event:device_uuid:timestamp
      if (device_uuid.length !== 0) {
        const hash_key = 'event:' + device_uuid + ':' + obj.detail.timestamp;
        client.hmset(hash_key, o);

        console.log(`saved ${hash_key}`);
      }
    }
  });
  
  return io;
}
