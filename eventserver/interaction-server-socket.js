


module.exports = function(passportAuthorize) {

  var config = require('config');
  var io = require('socket.io')(config.get('InteractionServer.port'));
  var redis = require('redis');
  var {WorkspaceModel, DeviceModel} = require('./models/Models');

  // Storing the socket instance matched with device name
  var DevicenameToSocketTable = {};

  // To get session of passport in socket logic, use passport.socketio middleware.
  io.use(passportAuthorize);


  io.on('connection', function(socket){

  	// save some data.
  	socket.data = {
  		user: socket.request.user,
  		referer: socket.request.headers.referer,
		  workspaceId: socket.request.headers.referer.split('/').pop(),
	  };


  	if (!socket.data.workspaceId || !socket.data.user.logged_in) {
  		return;
	  }


  	// setting client config for sub/pub by key name.
	  const subClient = redis.createClient();
	  subClient.config('set', 'notify-keyspace-events', 'AKE', function(err) {
		  if (err) { return console.log(err); }
	  });

	  // subscribe devices
	  UpdateWorkspaceSubscription(socket.data.workspaceId);


    socket.on('WXREvent', function (msg) {

	    if (!!msg === false || !!msg.type === false || !!msg.detail === false) {
		    handleError(`invalid msg!: ${JSON.stringify(msg)}`);
		    return;
	    }

	    // A message that has invalid timestamp will be dropped.
	    let timestamp = msg.timestamp;
	    if (!!timestamp === false) {
		    handleError(`invalid timestamp!: ${JSON.stringify(msg)}`);
		    return;
	    }


	    // Save the data
	    // Be aware!! The device is should exist in database. The addEventAt method doesn't check key validation.
	    DeviceModel.addEventAt(msg.id, msg);

    });

    socket.on('disconnect', function () {

    });



    function handleError(message) {
    	socket.emit('error', message);
    	console.log(message);
    }

	  function UpdateWorkspaceSubscription(wsId) {

		  WorkspaceModel._pFindAndLoad(wsId)
			  .then( instance => instance ? instance.getAttachedDevices() : Promise.reject(`Invalid Workspace ID.`) )
			  .then( wsAttached => {

			  	// Reset all subscription
				  const allChannel = `__keyspace@` + config.get('dbConfig.db') + `__:*`;
				  subClient.punsubscribe(allChannel);

			  	// Subscribe event data stream of attached device
				  const wsAttachedWithoutMine = wsAttached.filter( device => device.p('ownerId') !== socket.data.user.id );
				  wsAttachedWithoutMine.forEach( device => {
				  	const deviceEventAdditionChannel = `__keyspace@` + config.get('dbConfig.db') + `__:` + device.getEventSetKey();
					  subClient.subscribe(deviceEventAdditionChannel);
				  });

				  // Subscribe workspace-device relation update
				  const workspaceDeviceRelationUpdateChannel = `__keyspace@` + config.get('dbConfig.db') + `__:nohm:relations:WorkspaceModel:attached:DeviceModel:` + wsId;
				  subClient.subscribe(workspaceDeviceRelationUpdateChannel);

				  let lastestMessage = '';
				  subClient.on('message', (channel, event) => {

				  	switch (event) {
						  case 'zadd':
							  const deviceId = channel.split(':').slice(0, -1).pop();
							  DeviceModel.getLastestEventOf(deviceId, (err, ret) => {
								  if (err) return console.log(err);
								  else if (lastestMessage === ret[0]) return;
								  lastestMessage = ret[0];
								  socket.emit('WXREvent', JSON.parse(lastestMessage));
							  });

						    break;

						  case 'sadd':
						  case 'srem':
							  UpdateWorkspaceSubscription(wsId);

						  	break;

						  default:
						  	break;
					  }
				  });
			  })
			  .catch( reason => {
				  console.log(reason);
			  });
	  };

  });

  return io;
};