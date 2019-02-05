var camera, scene, renderer;
var cameraControls;

var clock = new THREE.Clock();

function fillScene() {
	scene = new THREE.Scene();
	scene.fog = new THREE.Fog( 0x808080, 2000, 4000 );

	scene.add(new THREE.AmbientLight( 0x222222 ));

	var light = new THREE.DirectionalLight( 0xffffff, 0.7 );
	light.position.set( 200, 500, 500 );
	scene.add(light);

	light = new THREE.DirectionalLight( 0xffffff, 0.9 );
	light.position.set( -200, -100, -400 );
	scene.add(light);
;

 var gridXZ = new THREE.GridHelper(2000, 100);
 gridXZ.setColors( new THREE.Color(0xCCCCCC), new THREE.Color(0x888888) );
 scene.add(gridXZ);

 var axes = new THREE.AxisHelper(150);
 axes.position.y = 1;
 scene.add(axes);

 drawBall();
}

function drawBall() {

	var cylinder;

	var cylinderMaterial	= new THREE.MeshPhongMaterial({ color: 0x5500DD,
			specular: 0xD1F5FD,
			shininess: 100 });

	var cylinderGeo = new THREE.CylinderGeometry( 3, 3, 500, 32 );

	for(var i = 0; i < 500; i++) {

		cylinder = new THREE.Mesh( cylinderGeo, cylinderMaterial );

		var untransformedCylinder = cylinder.clone();
		console.log("Untransformed cylinder matrix:")
		console.log(untransformedCylinder.matrix); // Look at the console
		scene.add(untransformedCylinder);

		var x = getCoor();
		var y = getCoor();
		var z = getCoor();

		var maxCorner = new THREE.Vector3(  x, y, z );
		var minCorner = new THREE.Vector3( -x, -y, -z );
		var cylAxis = new THREE.Vector3().subVectors( maxCorner, minCorner );

		cylAxis.normalize();

		var theta = Math.acos( cylAxis.y );

		var a = getCoor();
		var b = getCoor();
		var c = getCoor();

		var rotationAxis = new THREE.Vector3(a, b, c);

		rotationAxis.normalize();

		cylinder.matrixAutoUpdate = false;

		cylinder.matrix.makeRotationAxis( rotationAxis, theta );

		console.log("Theta: " + theta);
		console.log("  cos: " + Math.cos(theta));
		console.log("  sin: " + Math.sin(theta));

		console.log("Transformed cylinder matrix:")
		console.log(cylinder.matrix);

		scene.add( cylinder );

	}

}

function init() {
	var canvasWidth = 600;
	var canvasHeight = 400;
	var canvasRatio = canvasWidth / canvasHeight;

	renderer = new THREE.WebGLRenderer( { antialias: true } );

	renderer.gammaInput = true;
	renderer.gammaOutput = true;
	renderer.setSize(canvasWidth, canvasHeight);
	renderer.setClearColor( 0xAAAAAA, 1.0 );

	camera = new THREE.PerspectiveCamera( 45, canvasRatio, 1, 4000 );

	cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
	camera.position.set( -800, 600, 500);
	cameraControls.target.set(0,0,0);
}

function getCoor() {
	var num = Math.random() * 2 - 1;
	return num;
}

function addToDOM() {
    var canvas = document.getElementById('canvas');
    canvas.appendChild(renderer.domElement);
}

function animate() {
	window.requestAnimationFrame(animate);
	render();
}

function render() {
	var delta = clock.getDelta();
	cameraControls.update(delta);
	renderer.render(scene, camera);
}

try {
  init();
  fillScene();
  addToDOM();
  animate();
} catch(error) {
    console.log("Your program encountered an unrecoverable error, can not draw on canvas. Error was:");
    console.log(error);
}
