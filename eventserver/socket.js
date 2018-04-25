


module.exports = function(passportAuthorize) {

  var config = require('config');
  var io = require('socket.io')(config.get('SocketIO.port'));
  var redis = require('redis');
  var {WorkspaceModel, DeviceModel} = require('./models/Models');

  // Storing the socket instance matched with device name
  var DevicenameToSocketTable = {};

  // To get session of passport in socket logic, use passport.socketio middleware.
  io.use(passportAuthorize);

  io.on('connection', function(socket){



  	// save some data.
  	socket.data = {
  		referer: socket.request.headers.referer,
		  workspaceId: socket.request.headers.referer.split('/').pop(),
	  };


  	// setting client config for sub/pub by key name.
	  const subClient = redis.createClient();
	  subClient.config('set', 'notify-keyspace-events', 'AKE', function(err) {
		  if (err) { return console.log(err); }
	  });

	  // subscribe devices
	  WorkspaceModel._pFindAndLoad(socket.data.workspaceId)
		  .then( instance => instance.getAttachedDevices() )
		  .then( wsAttached => {
			  wsAttached = wsAttached.map( device => device.p('ownerId') !== socket.user.id );
			  wsAttached.forEach( device => {
				  subClient.subscribe('__keyspace@1__:' + device.getEventSetKey() );
			  });

			  let lastestMessage = '';
			  subClient.on('message', (channel, event) => {

			  	const deviceId = channel.split(':').slice(0, -1).pop();

				  if (event === 'zadd') {
					  DeviceModel.getLastestEventOf(deviceId, (err, ret) => {
						  if (err) return console.log(err);
						  else if (lastestMessage === ret[0]) return;
						  lastestMessage = ret[0];
						  socket.emit('WXREvent', lastestMessage);
					  });
				  }
			  });
		  });



    socket.on('WXREvent', function (msg) {

	    if (!!msg === false || !!msg.event === false || !!msg.detail === false) {
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
	    // TODO: Checking save validation.
	    DeviceModel.addEventAt(msg.id, msg);

    });

    socket.on('disconnect', function () {

    });



    function handleError(message) {
    	socket.emit('error', message);
    	console.log(message);
    }

  });


  // for update the list of publishing device event data, just call this.
	// if there are some change of Workspace-Device linkage, this should have to be called once.
  global.refreshDeviceEventPublishListOf = function(device) {
		const socket = DevicenameToSocketTable[device.p('name')];

		if (!!socket === false) {
			return Promise.reject(`This device is not connected`);
		}

		return device.getLinkedWorkspaces()
			.then( workspaces => {
				socket.data.eventDataPublishingList = [];
				workspaces.forEach( e => socket.data.eventDataPublishingList.push(e.getChannelName()) );

				console.log(socket.data.eventDataPublishingList);
			})
  };

  return io;
};