////////////////////////////////////////////////////////////////////////////////
/*global THREE, Coordinates, document, window  */
var camera, scene, renderer, cameraControls, canvasWidth, canvasHeight;
var v1, v2, v3, b1, t1, t2, t3, tri, b1, b2, b3, triNormal, center, inTriangle;
var v1label, v2label, v3label, plabel;
var objects = [];
var plane = new THREE.Plane(),
mouse = new THREE.Vector2(),
offset = new THREE.Vector3(),
intersection = new THREE.Vector3(), INTERSECTED, SELECTED;

var projector = new THREE.Projector();
var raycaster = new THREE.Raycaster();
var clock = new THREE.Clock();

function fillScene() {
	scene = new THREE.Scene();
	scene.fog = new THREE.Fog( 0x808080, 2000, 4000 );
	scene.add( new THREE.AmbientLight( 0x222222 ) );

	var light = new THREE.DirectionalLight( 0xffffff, 0.9 );
	light.position.set( -200, 500, 500 );
	scene.add( light );

	light = new THREE.DirectionalLight( 0xffffff, 0.6 );
	light.position.set( 100, 100, -400 );
	scene.add( light );

  //grid xz
  var gridXZ = new THREE.GridHelper(2000, 100, new THREE.Color(0xCCCCCC), new THREE.Color(0x888888));
  scene.add(gridXZ);

  //axes
  var axes = new THREE.AxisHelper(150);
  axes.position.y = 1;
  scene.add(axes);

  drawTriangle();
}

function drawTriangle() {
	// Triangle vertices represented as spheres
  v1 = new THREE.Mesh( new THREE.SphereGeometry( 30, 12, 12),
                       new THREE.MeshLambertMaterial({ color: 0xff0000 }));
  v1.position.x = 100;
  v1.position.y = 520;
  v1.position.z = 200;
  scene.add( v1 );

  v2 = new THREE.Mesh( new THREE.SphereGeometry( 30, 12, 12),
                       new THREE.MeshLambertMaterial({ color: 0x00ff00 }));
  v2.position.x = 100;
  v2.position.y = 300;
  v2.position.z = -200;
  scene.add( v2 );

  v3 = new THREE.Mesh( new THREE.SphereGeometry( 30, 12, 12),
                       new THREE.MeshLambertMaterial({ color: 0x0000ff }));
  v3.position.x = -50;
  v3.position.y = -50;
  v3.position.z = 300;
  scene.add( v3 );

  // center is used for the initial position of p, and also for the positioning of
  // the line representing the normal.
  center = new THREE.Vector3( (v1.position.x + v2.position.x + v3.position.x)/3,
                              (v1.position.y + v2.position.y + v3.position.y)/3,
                              (v1.position.z + v2.position.z + v3.position.z)/3);

  // p is the point we want to calculate barycentric coordinates for
  p = new THREE.Mesh( new THREE.SphereGeometry( 40, 12, 12),
                      new THREE.MeshLambertMaterial());

  p.position.copy(center);

  // p's color is based on the barycentric coordinates.
  // Initialized in init() as 0.33, 0.33, 0.33.
  p.material.color.setRGB(b1, b2, b3);

  scene.add(p);

  var geo = new THREE.Geometry();
  geo.vertices = [v1.position, v2.position, v3.position];
  geo.faces = [new THREE.Face3(0, 1, 2)];

  tri = new THREE.Mesh(geo,
    new THREE.MeshBasicMaterial({ color: 0xffffff,
                                  wireframe: true,
                                  wireframeLinewidth: 2,
                                  side: THREE.DoubleSide} ));
  scene.add(tri);

  // this line will be used to display the face normal direction
  // its geometry will be set based on the orientation of the face
  // in the render function.
  triNormal = new THREE.Line(new THREE.Geometry(),
    new THREE.LineBasicMaterial({ color: 0xffffff,
                                  linewidth: 2 }));
  scene.add(triNormal);

  geo = new THREE.Geometry();
  geo.vertices = [v2.position, v3.position, p.position];
  geo.faces = [new THREE.Face3(0, 1, 2)];
  t1 = new THREE.Mesh(geo,
    new THREE.MeshBasicMaterial({ color: 0xff0000,
                                  transparent: true,
                                  opacity: 0.2,
                                  side: THREE.DoubleSide }));
  scene.add(t1);

  geo = new THREE.Geometry();
  geo.vertices = [v1.position, p.position, v3.position];
  geo.faces = [new THREE.Face3(0, 1, 2)];
  t2 = new THREE.Mesh(geo,
    new THREE.MeshBasicMaterial({ color: 0x00ff00,
                                  transparent: true,
                                  opacity: 0.2,
                                  side: THREE.DoubleSide }));
  scene.add(t2);

  geo = new THREE.Geometry();
  geo.vertices = [v2.position, p.position, v1.position];
  geo.faces = [new THREE.Face3(0, 1, 2)];
  t3 = new THREE.Mesh(geo,
    new THREE.MeshBasicMaterial({ color: 0x0000ff,
                                  transparent: true,
                                  opacity: 0.2,
                                  side: THREE.DoubleSide }));
  scene.add(t3);

  // objects that we want to test for intersection (picking) by
  // the ray caster
  objects = [v1, v2, v3, p];
}

function init() {
	canvasWidth = 600;
	canvasHeight = 400;

	var canvasRatio = canvasWidth / canvasHeight;
  b1 = 0.33;
  b2 = 0.33;
  b3 = 0.33;
  inTriangle = true;

	// RENDERER
	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.gammaInput = true;
	renderer.gammaOutput = true;
	renderer.setSize(canvasWidth, canvasHeight);
	renderer.setClearColor( 0xAAAAAA, 1.0 );
  renderer.domElement.addEventListener( 'mousemove', onDocumentMouseMove, false );
  renderer.domElement.addEventListener( 'mousedown', onDocumentMouseDown, false );
  renderer.domElement.addEventListener( 'mouseup', onDocumentMouseUp, false );
  renderer.setPixelRatio( window.devicePixelRatio );

	// CAMERA
	camera = new THREE.PerspectiveCamera( 45, canvasRatio, 1, 4000 );

	// CONTROLS
	cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
	camera.position.set( -800, 600, -500);
	cameraControls.target.set(4,301,92);

	// HTML LABELS
	v1label = document.createElement('div');
	v1label.style.position = 'absolute';
	v1label.style['pointer-events'] = 'none';
	v1label.style.width = 100;
	v1label.style.height = 50;

	v2label = document.createElement('div');
	v2label.style.position = 'absolute';
	v2label.style['pointer-events'] = 'none';
	v2label.style.width = 100;
	v2label.style.height = 50;

	v3label = document.createElement('div');
	v3label.style.position = 'absolute';
	v3label.style['pointer-events'] = 'none';
	v3label.style.width = 100;
	v3label.style.height = 50;

	plabel = document.createElement('div');
	plabel.style.position = 'absolute';
	plabel.style['pointer-events'] = 'none';
	plabel.style.width = 100;
	plabel.style.height = 50;
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

  tri.geometry.vertices = [v1.position, v2.position, v3.position]
  tri.geometry.verticesNeedUpdate = true;

  t1.geometry.vertices = [v2.position, v3.position, p.position];
  t1.geometry.verticesNeedUpdate = true;

  t2.geometry.vertices = [v1.position, p.position, v3.position];;
  t2.geometry.verticesNeedUpdate = true;

  t3.geometry.vertices = [v2.position, p.position, v1.position];
  t3.geometry.verticesNeedUpdate = true;

  t1.visible = t2.visible = t3.visible = inTriangle;

  center.set((v1.position.x + v2.position.x + v3.position.x)/3,
              (v1.position.y + v2.position.y + v3.position.y)/3,
              (v1.position.z + v2.position.z + v3.position.z)/3);

  // it's necessary to call computeFaceNormals() to use the normals of a face
  tri.geometry.computeFaceNormals();
  // set the geometry for the line object to represent the face normal
  // for display purposes.
  triNormal.geometry.vertices = [
		center.clone(),
		center.clone().add(tri.geometry.faces[0].normal.multiplyScalar(250))];

  triNormal.geometry.verticesNeedUpdate = true;

  // if p is inside the triangle, set its color to the barycentric coords
  // otherwise, color it black
  if (inTriangle) {
    p.material.color.setRGB(b1, b2, b3);
  } else {
    p.material.color.setRGB(0, 0, 0);
  }

	// place x, y, z HTML labels on each of the points
	camera.updateMatrixWorld();
	v1label.style.top = (toXYCoords(v1.position).y + $("#canvas").offset().top + 10)  + 'px';
	v1label.style.left = (toXYCoords(v1.position).x + $("#canvas").offset().left + 10) + 'px';
	v1label.innerHTML =
		Math.round(v1.position.x) + ", " +
		Math.round(v1.position.y) + ", " +
		Math.round(v1.position.z);
	document.body.appendChild(v1label);

	v2label.style.top = (toXYCoords(v2.position).y + $("#canvas").offset().top + 10)  + 'px';
	v2label.style.left = (toXYCoords(v2.position).x + $("#canvas").offset().left + 10) + 'px';
	v2label.innerHTML =
		Math.round(v2.position.x) + ", " +
		Math.round(v2.position.y) + ", " +
		Math.round(v2.position.z);
	document.body.appendChild(v2label);

	v3label.style.top = (toXYCoords(v3.position).y + $("#canvas").offset().top + 10)  + 'px';
	v3label.style.left = (toXYCoords(v3.position).x + $("#canvas").offset().left + 10) + 'px';
	v3label.innerHTML =
		Math.round(v3.position.x) + ", " +
		Math.round(v3.position.y) + ", " +
		Math.round(v3.position.z);
	document.body.appendChild(v3label);

	plabel.style.top = (toXYCoords(p.position).y + $("#canvas").offset().top + 10)  + 'px';
	plabel.style.left = (toXYCoords(p.position).x + $("#canvas").offset().left + 10) + 'px';
	plabel.innerHTML =
		Math.round(p.position.x) + ", " +
		Math.round(p.position.y) + ", " +
		Math.round(p.position.z);
	document.body.appendChild(plabel);

	renderer.render(scene, camera);
}


function onDocumentMouseMove( event ) {
	event.preventDefault();
  // this converts window mouse values to x and y mouse coordinates that range
  // between -1 and 1 in the canvas
  mouse.set(
     (( event.clientX / window.innerWidth ) * 2 - 1) *
     (window.innerWidth/canvasWidth),
     (-((event.clientY - ($("#canvas").position().top + (canvasHeight/2))) / window.innerHeight) * 2 )
     * (window.innerHeight/canvasHeight));

  // uses Three.js built-in raycaster to send a ray from the camera
	raycaster.setFromCamera( mouse, camera );
	if ( SELECTED ) {
    if (SELECTED === p ) {
      // in the case that p is selected, the draggng plane should be coplanar with
      // the triangle
      plane.setFromCoplanarPoints(
        tri.geometry.vertices[0],
        tri.geometry.vertices[1],
        tri.geometry.vertices[2]);

      // if p is dragged, we need to recalculate the barycentric coordinates
      recalculateBarycentricCoords();
    }
    if ( raycaster.ray.intersectPlane( plane, intersection ) ) {
      SELECTED.position.copy( intersection.sub( offset ) );
    }
    if (SELECTED != p ){
      // if one of the triangle corners is dragged, p should be repositioned on the
      // new triangle according to its unchanged barycentric coordinates
      p.position.x = (v1.position.x * b1 + v2.position.x * b2 + v3.position.x * b3);
      p.position.y = (v1.position.y * b1 + v2.position.y * b2 + v3.position.y * b3);
      p.position.z = (v1.position.z * b1 + v2.position.z * b2 + v3.position.z * b3);
    }
		return;
	}

  // determines which objects are intersected by the ray, and sets the dragging
  // plane with respect to the camera view.
	var intersects = raycaster.intersectObjects(objects);
	if ( intersects.length > 0 ) {
		if ( INTERSECTED != intersects[0].object ) {
			INTERSECTED = intersects[0].object;
			plane.setFromNormalAndCoplanarPoint(
        camera.getWorldDirection( plane.normal ),
        INTERSECTED.position);
		}
		canvas.style.cursor = 'pointer';
	} else {
		INTERSECTED = null;
		canvas.style.cursor = 'auto';
	}
}

// handles mouse down event
function onDocumentMouseDown( event ) {
	event.preventDefault();
	raycaster.setFromCamera( mouse, camera );
	var intersects = raycaster.intersectObjects( objects );
	if ( intersects.length > 0 ) {
		cameraControls.enabled = false;
		SELECTED = intersects[ 0 ].object;
		if ( raycaster.ray.intersectPlane( plane, intersection ) ) {
			offset.copy( intersection ).sub( SELECTED.position );
		}
		canvas.style.cursor = 'move';
	}
}

// handles mouse up event
function onDocumentMouseUp( event ) {
	event.preventDefault();
	cameraControls.enabled = true;
	if ( INTERSECTED ) {
		SELECTED = null;
	}
	canvas.style.cursor = 'auto';
}

function toXYCoords (pos) {
  //var vector = projector.projectVector(pos.clone(), camera);
	var vector = pos.clone().project(camera);
	vector.x = (vector.x + 1)/2 * canvasWidth;
	vector.y = -(vector.y - 1)/2 * canvasHeight;
	//console.log(vector);
  return vector;
}

function recalculateBarycentricCoords(){

	// Calculate boundaries.

	var border1 = v3.position.clone().sub(v2.position);
	var border2 = v1.position.clone().sub(v3.position);
	var border3 = v2.position.clone().sub(v1.position);

	// Calculate edges.

	var vertex1 = p.position.clone().sub(v1.position);
	var vertex2 = p.position.clone().sub(v2.position);
	var vertex3 = p.position.clone().sub(v3.position);

	// Calculate intersections.

	var b13 = border1.clone().cross(vertex3.clone());
	var b21 = border2.clone().cross(vertex1.clone());
	var b32 = border3.clone().cross(vertex2.clone());

	var aux = border1.clone().cross(border2.clone());

	var total = aux.clone().normalize();

	// Triangles

	var t1 = total.dot(aux) / 2;
	var t2 = total.dot(b13) / 2;
	var t3 = total.dot(b21) / 2;
	var t4 = total.dot(b32) / 2;

	// Update global variable

	b1 = t2 / t1;
	b2 = t3 / t1;
	b3 = t4 / t1;

	// Check whether the element is within the triangle.

	if (b1 < 0 || b2 < 0 || b3 < 0 || b1 > 1 || b2 > 1 || b3 > 1) {
		inTriangle = false;
	} else {
		inTriangle = true;
	}

};

try {
  init();
  fillScene();
  addToDOM();
  animate();
} catch(error) {
    console.log(error);
}
