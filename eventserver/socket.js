


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

  	// Pub/Sub client
	  let pubClient = redis.createClient();
	  let subClient = redis.createClient();

  	// namespace for saving event handling data.
  	socket.data = {
  		eventDataPublishingList: [],
  		enteredWorkspaceName: '',
		  isLocalPackagedEvents: false,
		  remoteAddress: '',
		  serverName: '',
		  deviceName: '',
		  deviceInstance: null
	  };


    /*
     * Routine for event data receiver
     */

    // This may can be done by passport session.
	  socket.on('enter_workspace', function(workspaceName) {

		  // Check the user session is live and save in session-socket table.
		  if (!!socket.request.user === false) {
			  // Do nothing with unauthorized session
			  handleError(`you have no session.`);
			  return;
		  }

		  socket.data.enteredWorkspaceName = workspaceName;

		  WorkspaceModel.findAndLoadByName(workspaceName)
			  .then( workspaceInstance => !!workspaceInstance === true ? Promise.resolve(workspaceInstance) : Promise.reject('Cannot find workspace') )
			  .catch( reason => handleError(reason) )
			  .then( workspaceInstance => {

				  const channelName = workspaceInstance.getChannelName();
				  subClient.subscribe(channelName);
				  subClient.on('message', (channel, message) => {
			  		socket.emit('vrpn_event', message);
				  });

			  	if (!!socket.data.deviceInstance === true)
			  	  workspaceInstance.attachDevice(socket.data.deviceInstance);
			  	else
			  		console.log(socket.data.deviceInstance);

				  socket.emit('enter_workspace_response', `ok: ${channelName}`);

			  })

	  })





	  /*
	   * Routine for event data sender
	   */

    socket.on('vrpn_event', function (msg) {

	    if (!!msg === false || !!msg.event === false || !!msg.detail === false) {
		    handleError(`invalid msg!: ${JSON.stringify(msg)}`);
		    return;
	    }

	    // Q: If timestamp is invalid, throw away it? Or create new one in event server?
	    // A message that has invalid timestamp will be dropped.
	    let timestamp = msg.detail.timestamp;
	    if (!!timestamp === false) {
		    handleError(`invalid timestamp!: ${JSON.stringify(msg)}`);
		    return;
	    }

	    // Route the event data.
	    switch (msg.event) {
		    case 'optitrack_server_on':


			    break;
		    case 'local_server_on':

			    socket.data.isLocalPackagedEvents = true;
			    const remoteAddress = socket.data.remoteAddress = socket.request.connection.remoteAddress.split(':')[3];
			    const serverName = socket.data.serverName = msg.detail.serverName || 'noname';
			    const deviceName = socket.data.deviceName = DeviceModel.resolveDeviceName(remoteAddress, serverName);

			    DevicenameToSocketTable[deviceName] = socket;

			    DeviceModel.findAndLoadByName(deviceName)
				    .then( device => !!device === false ? DeviceModel.create(remoteAddress, serverName) : Promise.resolve(device) )
				    .then( device => socket.data.deviceInstance = device )
				    .then( () => refreshDeviceEventPublishListOf(socket.data.deviceInstance) )
				    .then( () => publishMessage(msg) )
				    .catch( reason => handleError(reason) )


			    break;
		    case 'local_packaged_events':

			    if (socket.data.isLocalPackagedEvents === true && !!socket.data.deviceInstance === true) {
			    	publishMessage(msg)
			    } else {
			    	handleError(`message is dropped`);
			    }


			    break;
	    }

    });

    socket.on('disconnect', function () {
	    /*
			 * save local_server_off event manually in event server
			 * due to detecting websocket disconnected is only possible by event server
			 *
			 * < message structure >
			 * { event: 'local_server_off',
			 *   detail: {
			 *     timestamp: timestamp,
			 *     server_name: 'dummy_server' } }
			 */

	    const msg = {
		    event: 'local_server_off',
		    detail: {
			    timestamp: Date.now(),
			    server_name: socket.data.deviceInstance.p('name')
		    }
	    }

	    if (!!socket.data.deviceInstance === false) {
	    	handleError(`Device is not set up`);
	    } else {
		    console.log('user is disconnected');
		    publishMessage(msg);
	    }


    });



    // helper functions.
    function publishMessage(msg) {
	    socket.data.deviceInstance.addEvent(msg);
	    socket.data.eventDataPublishingList.forEach( channelName => pubClient.publish(channelName, JSON.stringify(msg)) )
    }

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
  }

  return io;
}
