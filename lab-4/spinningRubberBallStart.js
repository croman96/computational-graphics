var camera, scene, renderer;
var cameraControls;
var canvasWidth = 600;
var canvasHeight = 400;
var canvas = document.getElementById('canvas');
var clock = new THREE.Clock();
var kooshball = new THREE.Object3D();
var spinSpeed = 0.05;
var spinAxis = new THREE.Vector3(0, 1, 0);
var spinAngle = 0;

function fillScene() {
	scene = new THREE.Scene();
	scene.fog = new THREE.Fog( 0x808080, 2000, 4000 );

	scene.add( new THREE.AmbientLight( 0x222222 ) );

	var light = new THREE.DirectionalLight( 0xffffff, 0.7 );
	light.position.set( 200, 500, 500 );

	scene.add( light );

	light = new THREE.DirectionalLight( 0xffffff, 0.9 );
	light.position.set( -200, -100, -400 );

	scene.add( light );

 var gridXZ = new THREE.GridHelper(2000, 100);
 gridXZ.setColors( new THREE.Color(0xCCCCCC), new THREE.Color(0x888888) );
 scene.add(gridXZ);

 var axes = new THREE.AxisHelper(150);
 axes.position.y = 1;
 scene.add(axes);

 drawKooshBall();
}

function drawKooshBall() {
	var cylinder;

	var cylMats = [
		new THREE.MeshPhongMaterial( { color: 0x5500DD, specular: 0xD1F5FD, shininess: 100 } ),
		new THREE.MeshPhongMaterial( { color: 0x05FFFF, specular: 0xD1F5FD, shininess: 100 } ),
	];
	var cylinderGeo = new THREE.CylinderGeometry( 3, 3, 500, 32 );

	for (var i = 1; i <= 1200; i++) {
		var rx = Math.random() * 2 - 1;
		var ry = Math.random() * 2 - 1;
		var rz = Math.random() * 2 - 1;

		var maxCorner = new THREE.Vector3(  rx, ry, rz );
		var minCorner = new THREE.Vector3( -rx, -ry, -rz );

		var cylAxis = new THREE.Vector3().subVectors( maxCorner, minCorner );

		cylAxis.normalize();
		var theta = Math.acos( cylAxis.y );

		var cylinder = new THREE.Mesh( cylinderGeo, cylMats[i%2] );
		var rotationAxis = new THREE.Vector3(rx, ry, rz);

		rotationAxis.normalize();

		var quaternion = new THREE.Quaternion().setFromAxisAngle( rotationAxis, theta );
		cylinder.rotation.setFromQuaternion( quaternion );

		kooshball.add( cylinder );
	}

	scene.add( kooshball );
}

function init() {
	var canvasRatio = canvasWidth / canvasHeight;

	addMouseHandler(canvas);

	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.gammaInput = true;
	renderer.gammaOutput = true;
	renderer.setSize(canvasWidth, canvasHeight);
	renderer.setClearColor( 0xAAAAAA, 1.0 );

	camera = new THREE.PerspectiveCamera( 45, canvasRatio, 1, 4000 );
	camera.position.set( -800, 600, 500);
	camera.lookAt( new THREE.Vector3(0, 0, 0));
}

function addToDOM() {
    canvas.appendChild(renderer.domElement);
}

function animate() {
	window.requestAnimationFrame(animate);
	render();
}

function render() {
	if (spinAngle > Math.PI * 2) {
		spinAngle = spinAngle - Math.PI * 2;
	}

	spinAngle = spinAngle + spinSpeed;

  if(spinSpeed > 0.001) {
		spinSpeed -= 0.003;
	} else {
    spinSpeed = 0;
  }
  spinAngle = spinAngle + spinSpeed;

	kooshball.matrixAutoUpdate = false;
	kooshball.matrix.makeRotationAxis( spinAxis, spinAngle);

	renderer.render(scene, camera);
}

var mouseDown;
var swipeStart;

function getMousePoint(clientX, clientY){
	var vector = new THREE.Vector3();
	vector.set(
     ( clientX / window.innerWidth ) * 2 - 1,
     - ( clientY / window.innerHeight ) * 2 + 1,
     0.5 );
	vector.unproject( camera );
	var dir = vector.sub( camera.position ).normalize();
	var distance = -camera.position.z / dir.z;
	return camera.position.clone().add( dir.multiplyScalar( distance ) );
}

function onMouseDown(evt) {
	evt.preventDefault();
	mouseDown = true;
	swipeStart = getMousePoint(evt.clientX, evt.clientY);
  clickStart = clock.getElapsedTime();
}

function onMouseMove(evt) {
  if (!mouseDown) {
    return;
  } else {
	  evt.preventDefault();
		swipeEnd = getMousePoint(evt.clientX, evt.clientY);
    var swipeVector = new THREE.Vector3(swipeEnd.x - swipeStart.x, swipeEnd.y - swipeStart.y, 0);
    spinAxis = new THREE.Vector3().crossVectors(camera.position, swipeVector).normalize();
    magnitude = Math.sqrt(Math.pow(swipeVector.x, 2) + Math.pow(swipeVector.y, 2));
		console.log(magnitude);
		time = clock.getElapsedTime()/clickStart;
		spinSpeed = (magnitude / time)/1000;
	}
}

function addMouseHandler(canvas) {
  canvas.addEventListener('mousemove', function (e) {
    onMouseMove(e);
  }, false);
  canvas.addEventListener('mousedown', function (e) {
    onMouseDown(e);
  }, false);
  canvas.addEventListener('mouseup', function (e) {
		e.preventDefault();
	  mouseDown = false;
  }, false);
	canvas.addEventListener ("mouseout", function (e) {
		e.preventDefault();
		mouseDown = false;
  }, false);
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
