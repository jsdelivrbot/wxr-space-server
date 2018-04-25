

window.onload = function() {


	EventHandler.addHandler( msg => {
		console.log(msg);
		if (msg.event === 'trackerMoved') {
			const [x, y, z] = msg.detail.pos;
			sphere.position.set(x, y, z);
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

	  sphere = new THREE.Mesh( new THREE.SphereGeometry( 0.1, 8, 8 ),
                              new THREE.MeshBasicMaterial( {color: 0xffff00} ) );
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

    render();

  }

  function render() {

    renderer.render( scene, camera );

  }

}

