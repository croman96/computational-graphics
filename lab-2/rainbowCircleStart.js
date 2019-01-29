var scene;
var camera;
var renderer;

var black = new THREE.Color(0x000000);
var red = new THREE.Color(0xff0000);
var orange = new THREE.Color(0xff7f00);
var yellow = new THREE.Color(0xffff00);
var green = new THREE.Color(0x00ff00);
var blue = new THREE.Color(0x0000ff);
var pinky = new THREE.Color(0xff96ca);
var pink = new THREE.Color(0xff69b4);

var length = 16;

initializeScene();
renderScene();

function initializeScene() {
    "use strict";

    if (Detector.webgl) {
        renderer = new THREE.WebGLRenderer({antialias: true});
    } else {
        renderer = new THREE.CanvasRenderer();
    }

    renderer.setClearColor(0x000000, 1);

    renderer.setSize(600, 400);

    document.getElementById("canvas").appendChild(renderer.domElement);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(55, 600 / 400, 1, 100);

    camera.position.set(0, 0, 10);

    camera.lookAt(scene.position);

    scene.add(camera);

    var rainbowCircleGeometry = new THREE.Geometry();

    for (var d = 0; d <= 360; d += 1) {
        var angle = Math.PI * (d / 180);

        // Innermost ring.
        rainbowCircleGeometry.vertices.push(new THREE.Vector3(
            Math.sin(angle) * 1,
            Math.cos(angle) * 1,
            0)
        );

        // Rest of rings.
        for (var ring = 1; ring < length; ring++) {
            rainbowCircleGeometry.vertices.push(new THREE.Vector3(
                Math.sin(angle) * (1 + ring * 0.25) * 1,
                Math.cos(angle) * (1 + ring * 0.25) * 1,
                0
            ));
            if (rainbowCircleGeometry.vertices.length > length) {

                rainbowCircleGeometry.faces.push(new THREE.Face3(
                    rainbowCircleGeometry.vertices.length - 1,
                    rainbowCircleGeometry.vertices.length - 2,
                    rainbowCircleGeometry.vertices.length - (length + 2)
                ));
                rainbowCircleGeometry.faces[rainbowCircleGeometry.faces.length - 1].vertexColors[0] = colors(ring);
                rainbowCircleGeometry.faces[rainbowCircleGeometry.faces.length - 1].vertexColors[1] = colors(ring-1);
                rainbowCircleGeometry.faces[rainbowCircleGeometry.faces.length - 1].vertexColors[2] = colors(ring-1);

                rainbowCircleGeometry.faces.push(new THREE.Face3(
                    rainbowCircleGeometry.vertices.length - 1,
                    rainbowCircleGeometry.vertices.length - (length + 1),
                    rainbowCircleGeometry.vertices.length - (length + 2))
                );
                rainbowCircleGeometry.faces[rainbowCircleGeometry.faces.length - 1].vertexColors[0] = colors(ring);
                rainbowCircleGeometry.faces[rainbowCircleGeometry.faces.length - 1].vertexColors[1] = colors(ring);
                rainbowCircleGeometry.faces[rainbowCircleGeometry.faces.length - 1].vertexColors[2] = colors(ring-1);
            }

        }
    }

    var rainbowCircleMaterial = new THREE.MeshBasicMaterial({
        vertexColors: THREE.VertexColors,
        wireframe: false,
        side: THREE.DoubleSide
    });

    var rainbowCircle = new THREE.Mesh(rainbowCircleGeometry, rainbowCircleMaterial);

    scene.add(rainbowCircle);
}

function renderScene() {
    renderer.render(scene, camera);
}

function colors(ring) {
    if (ring === 0){ return black; }
    if (ring === 1){ return red; }
    if (ring === 2){ return orange; }
    if (ring === 3){ return yellow; }
    if (ring === 4){ return green; }
    if (ring === 5){ return blue; }
    if (ring === 6){ return pink; }
    if (ring === 7){ return pinky; }
    if (ring === 8){ return pinky; }
    if (ring === 9){ return pink; }
    if (ring === 10){ return blue; }
    if (ring === 11){ return green; }
    if (ring === 12){ return yellow; }
    if (ring === 13){ return orange; }
    if (ring === 14){ return red; }
    if (ring === 15){ return black; }
}
