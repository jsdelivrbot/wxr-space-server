

window.onload = function() {

  var scale = 3;
  // socket connect
  var socket = io();
	console.log('socket connected');
	socket.on('vrpn_event', function(msg) {
	  msg = JSON.parse(msg);

	  if (msg.detail.messages.length > 0) {
		  const message = msg.detail.messages[0];
		  console.log(message.detail.pos);
		  sphere.position.x = message.detail.pos[0] * scale;
		  sphere.position.y = message.detail.pos[1] * scale;
		  sphere.position.z = message.detail.pos[2] * scale;
    }
	});




  var camera, tick = 0,
    scene, renderer, clock = new THREE.Clock(),
    controls, container,
    sphere;


  init();
  animate();

  function init() {

    //

    container = document.getElementById( 'container' );

    camera = new THREE.PerspectiveCamera( 28, window.innerWidth / window.innerHeight, 1, 10000 );
	  camera.position.set( 20, 10, 20 );
	  camera.lookAt( new THREE.Vector3() );

    scene = new THREE.Scene();


	  var geometry = new THREE.SphereGeometry( 0.1, 32, 32 );
	  var material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
	  sphere = new THREE.Mesh( geometry, material );
	  scene.add( sphere );


		// grid helper
		var size = 60;
		var divisions = 60;
		var colorCenterLine = 0x444444;
		var colorGrid = 0x888888;

		var gridHelper = new THREE.GridHelper( size, divisions, colorCenterLine, colorGrid );
		scene.add( gridHelper );

    //

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
	  renderer.setClearColor( 0xaaaaaa );
    container.appendChild( renderer.domElement );

    //

    controls = new THREE.EditorControls( camera, renderer.domElement );
	
	//
	
	
    window.addEventListener( 'resize', onWindowResize, false );

  }

  function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

  }

  function animate() {

    requestAnimationFrame( animate );

    var delta = clock.getDelta();

    tick += delta;

    if ( tick < 0 ) tick = 0;

    if ( delta > 0 ) {


    }

    render();

  }

  function render() {

    renderer.render( scene, camera );

  }

}

