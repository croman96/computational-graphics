var camera, scene, renderer;
var cameraControls;
var clock = new THREE.Clock();
var keyBoard = new KeyboardState();

var swivel = 0;
var bend = 0;
var grab = 0;

function fillScene() {
  scene = new THREE.Scene();
  scene.add(new THREE.AmbientLight(0x222222));
  light = new THREE.DirectionalLight(0xffffff, 0.7);
  light.position.set(200, 500, 500);
  scene.add(light);
  light = new THREE.DirectionalLight(0xffffff, 0.9);
  light.position.set(-200, -100, -400);
  scene.add(light);
  gridXZ = new THREE.GridHelper(2000, 100, new THREE.Color(0xCCCCCC), new THREE.Color(0x888888));
  scene.add(gridXZ);
  axes = new THREE.AxisHelper(150);
  axes.position.y = 1;
  scene.add(axes);
  drawRobot();
}

function drawRobot() {

	var basicMaterial = new THREE.MeshPhongMaterial({
		side: THREE.DoubleSide,
		color: 0x000000,
		wireframe: false
	});

	var matteMaterial = new THREE.MeshLambertMaterial({
		side: THREE.DoubleSide,
		color: 0xffffff
	});

  var cruzAzul = new THREE.MeshLambertMaterial({
		side: THREE.DoubleSide,
		color: 0x0000ff
	});

  var tenis = new THREE.MeshLambertMaterial({
		side: THREE.DoubleSide,
		color: 0xff0000
	});

	var trunk;
	var leg;

	trunk = new THREE.Mesh(new THREE.BoxGeometry(75, 150, 100), cruzAzul);
	trunk.position.x = 0;
	trunk.position.y = 225;
	trunk.position.z = 0;
	scene.add( trunk );

	var upperleg, lowerleg, upperlegGeometry, lowerlegGeometry, legMaterial;

  upperlegGeometry = new THREE.CylinderGeometry(12, 12, 100, 16, 16);
	lowerlegGeometry = new THREE.CylinderGeometry(12, 12, 100, 16, 16);

  legMaterial = matteMaterial;

  upperleg = new THREE.Mesh(upperlegGeometry, legMaterial);
	lowerleg = new THREE.Mesh(lowerlegGeometry, cruzAzul);

  var upperleftLeg, upperrightLeg, lowerleftLeg, lowerrightLeg, leftKnee, rightKnee;

  upperleftLeg = upperleg.clone();
	upperrightLeg = upperleg.clone();
	lowerleftLeg = lowerleg.clone();
	lowerrightLeg = lowerleg.clone();

  upperleftLeg.position.x = 0;
	upperleftLeg.position.y = -50;
	upperleftLeg.position.z = 0;
	scene.add(upperleftLeg);

  upperrightLeg.position.x = 0;
	upperrightLeg.position.y = -50;
	upperrightLeg.position.z = 0;
	scene.add(upperrightLeg);

  leftKnee = new THREE.Mesh(new THREE.SphereGeometry(17, 17, 17), matteMaterial);
	leftKnee.position.x = 0;
	leftKnee.position.y = -100;
	leftKnee.position.z = 0;
	scene.add(leftKnee);

  rightKnee = new THREE.Mesh(new THREE.SphereGeometry(17, 17, 17), matteMaterial);
	rightKnee.position.x = 0;
	rightKnee.position.y = -100;
	rightKnee.position.z = 0;
	scene.add(rightKnee);

  lowerleftLeg.position.x = 0;
	lowerleftLeg.position.y = -150;
	lowerleftLeg.position.z = 0;
	scene.add(lowerleftLeg);

  lowerleftLeg.position.x = 0;
	lowerrightLeg.position.y = -150;
	lowerrightLeg.position.z = 0;
	scene.add(lowerrightLeg);

	var footLength = 40;
	var footWidth = 20;
	var footShape = new THREE.Shape();

  footShape.moveTo(0, 0);
	footShape.lineTo(0, footWidth);
	footShape.lineTo(footLength, footWidth);
	footShape.lineTo(footLength, 0);
	footShape.lineTo(0, 0);

  var extrudeSettings = {
			steps: 2,
			amount: 10,
			bevelEnabled: true,
			bevelThickness: 3,
			bevelSize: 5,
			bevelSegments: 1
	};

	var geometry = new THREE.ExtrudeGeometry(footShape, extrudeSettings);
	var material = tenis;

  var foot = new THREE.Mesh(geometry, material);
	foot.rotateX(Math.PI / 2);

  var leftFoot = foot.clone();
	leftFoot.position.x = -10;
	leftFoot.position.y = -200;
	leftFoot.position.z = -10;

  var rightFoot = foot.clone();
	rightFoot.position.x = -10;
	rightFoot.position.y = -200;
	rightFoot.position.z = -10;
	scene.add(leftFoot);
	scene.add(rightFoot);

	var neckCylinder, neckCylinderGeometry, neckCylinderMaterial;
	neckCylinderGeometry = new THREE.CylinderGeometry(15, 15, 25, 16, 16);
	neckCylinderMaterial = matteMaterial;
	neckCylinder = new THREE.Mesh(neckCylinderGeometry, neckCylinderMaterial);
	neckCylinder.position.x = 0;
	neckCylinder.position.y = 315;
	neckCylinder.position.z = 0;
	scene.add(neckCylinder);

	var headBox, headBoxGeometry, headBoxMaterial;
	headBoxGeometry = new THREE.SphereGeometry(50, 260, 260);
	headBoxMaterial = matteMaterial;
	headBox = new THREE.Mesh(headBoxGeometry, headBoxMaterial);
	headBox.position.x = 0;
	headBox.position.y = 0;
	headBox.position.z = 0;
	scene.add(headBox);

	rightShoulder = new THREE.Mesh(new THREE.CylinderGeometry(15,15,30,20,1,false), cruzAzul);
	rightShoulder.position.x = 0;
	rightShoulder.position.y = -35;
	rightShoulder.position.z = 0;
	scene.add(rightShoulder);

	leftShoulder = new THREE.Mesh(new THREE.CylinderGeometry(15,15,30,20,1,false), cruzAzul);
	leftShoulder.position.x = 0;
	leftShoulder.position.y = -35;
	leftShoulder.position.z = 0;
	scene.add(leftShoulder);

	rightHumerus = new THREE.Mesh(new THREE.CylinderGeometry(10,10,80,20,1,false), matteMaterial);
	rightHumerus.position.x = 0;
	rightHumerus.position.y = -70;
	rightHumerus.position.z = 0;
	scene.add(rightHumerus);

	leftHumerus = new THREE.Mesh(new THREE.CylinderGeometry(10,10,80,20,1,false), matteMaterial);
	leftHumerus.position.x = 0;
	leftHumerus.position.y = -70;
	leftHumerus.position.z = 0;
	scene.add(leftHumerus);

	leftElbow = new THREE.Mesh(new THREE.CylinderGeometry(15,15,15,15,1,false),matteMaterial);
	leftElbow.position.x = 0;
	leftElbow.position.y = -300;
	leftElbow.position.z = 0;
	leftElbow.rotation.y = Math.PI/2;
	leftElbow.rotation.z = Math.PI/2;
	scene.add(leftElbow);

	rightElbow = new THREE.Mesh(new THREE.CylinderGeometry(15,15,15,15,1,false),matteMaterial);
	rightElbow.position.x = 0;
	rightElbow.position.y = -300;
	rightElbow.position.z = 0;
	rightElbow.rotation.y = Math.PI/2;
	rightElbow.rotation.z = Math.PI/2;
	scene.add(rightElbow);

	rightForarm = new THREE.Mesh(new THREE.CylinderGeometry(10,10,40,20,1,false),matteMaterial);
	rightForarm.position.x = 0;
	rightForarm.position.y = -330;
	rightForarm.position.z = 0;
	scene.add(rightForarm);

	leftForarm = new THREE.Mesh(new THREE.CylinderGeometry(10,10,40,20,1,false),matteMaterial);
	leftForarm.position.x = 0;
	leftForarm.position.y = -330;
	leftForarm.position.z = 0;
	scene.add(leftForarm);

  rightWrist = new THREE.Mesh(new THREE.CylinderGeometry(12,12,20,20,1,false),matteMaterial);
	rightWrist.position.x = 0;
	rightWrist.position.y = -360;
	rightWrist.position.z = 0;
	rightWrist.rotation.y = Math.PI/2;
	rightWrist.rotation.z = Math.PI/2;
	scene.add(rightWrist);

	leftWrist = new THREE.Mesh(new THREE.CylinderGeometry(12,12,20,20,1,false),matteMaterial);
	leftWrist.position.x = 0;
	leftWrist.position.y = -360;
	leftWrist.position.z = 0;
	leftWrist.rotation.y = Math.PI/2;
	leftWrist.rotation.z = Math.PI/2;
	scene.add(leftWrist);

  leftRobotForearm = new THREE.Group()
    .add(leftForarm)
    .add(leftElbow)
    .add(leftWrist);

  rightRobotForearm = new THREE.Group()
    .add(rightForarm)
    .add(rightElbow)
    .add(rightWrist);

  leftRobotArm = new THREE.Group()
    .add(leftRobotForearm)
    .add(leftHumerus)
    .add(leftShoulder);

  rightRobotArm = new THREE.Group()
    .add(rightRobotForearm)
    .add(rightHumerus)
    .add(rightShoulder);

  robotHead = new THREE.Group()
    .add(headBox)

  robotBody = new THREE.Group()
    .add(neckCylinder)
    .add(trunk);

  robotLeftLeg = new THREE.Group()
    .add(upperleftLeg)
    .add(leftKnee)
    .add(lowerleftLeg)
    .add(leftFoot);

  robotRightLeg = new THREE.Group()
    .add(upperrightLeg)
    .add(rightKnee)
    .add(lowerrightLeg)
    .add(rightFoot);

  robot = new THREE.Group()
    .add(robotHead)
    .add(robotBody)
    .add(robotLeftLeg)
    .add(robotRightLeg)
    .add(leftRobotArm)
    .add(rightRobotArm);

  innerGroup = new THREE.Group().add(robot);
  outerGroup = new THREE.Group().add(innerGroup);
  robotLeftLeg.position.set(0,150,-25);
  robotRightLeg.position.set(0,150,25);
  leftRobotForearm.position.set(0,200,0);
  leftRobotArm.position.set(0,300,-60);
  rightRobotArm.position.set(0,300,60);
  rightRobotForearm.position.set(0,200,0);
  robotHead.position.set(0,355,0);
  robot.position.set(0,60,0);

	scene.add(outerGroup);
}

function animate() {

    leftRobotArm.rotation.y = (swivel * Math.PI / 180);
    rightRobotArm.rotation.y = (swivel * Math.PI / 180);
    leftRobotForearm.rotation.z = (bend * Math.PI / 180);
    rightRobotForearm.rotation.z = (bend * Math.PI / 180);

    keyBoard.update();

    var moveSpeed = 5;
    var eyeSpeed = 0.1;

    var rotateSpeed = 2.5;
    rotateSpeed *= Math.PI / 180;

    var forward = new THREE.Vector3(1, 0, 0);
    forward.applyQuaternion(innerGroup.quaternion).normalize();

    if (keyBoard.pressed("W")) {
        outerGroup.translateOnAxis(forward, moveSpeed);
    }

    if (keyBoard.pressed("S")) {
        outerGroup.translateOnAxis(forward.multiplyScalar(-1), moveSpeed);
    }

    if (keyBoard.pressed("A")) {
        outerGroup.rotateY(rotateSpeed);
    }

    if (keyBoard.pressed("D")) {
        outerGroup.rotateY(-rotateSpeed);
    }

    if (keyBoard.pressed("W") || keyBoard.pressed("A") || keyBoard.pressed("S") || keyBoard.pressed("D")) {
        moveLegs();
    }

    window.requestAnimationFrame(animate);
    render();
}

var cycle = 0;

function moveLegs(){
  cycle = cycle == 360 ? 1 : ++cycle;
	cycle += 1;
  robotLeftLeg.rotation.z = Math.cos(cycle * (Math.PI/180));
	robotRightLeg.rotation.z = Math.cos(cycle * (Math.PI/180) + Math.PI);
  leftRobotArm.rotation.z = Math.cos(cycle * (Math.PI/180) + Math.PI);
	rightRobotArm.rotation.z = Math.cos(cycle * (Math.PI/180));
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
	camera.position.set( -800, 600, -500);
	cameraControls.target.set(4,301,92);
}

function addToDOM() {
    var canvas = document.getElementById('canvas');
    canvas.appendChild(renderer.domElement);
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
    console.log(error);
}
