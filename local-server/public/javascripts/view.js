

window.onload = function() {

  var scale = 2;
  // socket connect
  var socket = io();
	console.log('socket connected');
	socket.on('vrpn_event', function(msg) {
	  msg = JSON.parse(msg);

	  if (msg.detail.messages.length > 0) {
		  const message = msg.detail.messages[0];
		  console.log(message.detail.pos);
		  options.position.x = message.detail.pos[0] * scale;
		  options.position.y = message.detail.pos[1] * scale;
		  options.position.z = message.detail.pos[2] * scale;
    }
	});




  var camera, tick = 0,
    scene, renderer, clock = new THREE.Clock(),
    controls, container,
    options, spawnerOptions, particleSystem;


  init();
  animate();

  function init() {

    //

    container = document.getElementById( 'container' );

    camera = new THREE.PerspectiveCamera( 28, window.innerWidth / window.innerHeight, 1, 10000 );
	  camera.position.set( 20, 10, 20 );
	  camera.lookAt( new THREE.Vector3() );

    scene = new THREE.Scene();

    // The GPU Particle system extends THREE.Object3D, and so you can use it
    // as you would any other scene graph component.	Particle positions will be
    // relative to the position of the particle system, but you will probably only need one
    // system for your whole scene
	  var textureLoader = new THREE.TextureLoader();
    particleSystem = new THREE.GPUParticleSystem( {
      maxParticles: 250000,
	    particleNoiseTex: textureLoader.load("/textures/perlin-512.png"),
	    particleSpriteTex: textureLoader.load("/textures/particle2.png")
    } );

    scene.add( particleSystem );

    // options passed during each spawned

    options = {
      position: new THREE.Vector3(),
      positionRandomness: .3,
      velocity: new THREE.Vector3(),
      velocityRandomness: .5,
      color: 0xaa88ff,
      colorRandomness: .2,
      turbulence: .5,
      lifetime: 0.5,
      size: 3,
      sizeRandomness: 1
    };

    spawnerOptions = {
      spawnRate: 15000,
      horizontalSpeed: 1.5,
      verticalSpeed: 1.33,
      timeScale: 1
    };

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

    var delta = clock.getDelta() * spawnerOptions.timeScale;

    tick += delta;

    if ( tick < 0 ) tick = 0;

    if ( delta > 0 ) {

		/*
      options.position.x = Math.sin( tick * spawnerOptions.horizontalSpeed ) * 20;
      options.position.y = Math.sin( tick * spawnerOptions.verticalSpeed ) * 10;
      options.position.z = Math.sin( tick * spawnerOptions.horizontalSpeed + spawnerOptions.verticalSpeed ) * 5;
*/
		
      for ( var x = 0; x < spawnerOptions.spawnRate * delta; x++ ) {

        // Yep, that's really it.	Spawning particles is super cheap, and once you spawn them, the rest of
        // their lifecycle is handled entirely on the GPU, driven by a time uniform updated below

        particleSystem.spawnParticle( options );

      }

    }

    particleSystem.update( tick );

    render();

  }

  function render() {

    renderer.render( scene, camera );

  }

}

