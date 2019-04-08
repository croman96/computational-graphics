/*
    Carlos Roman - A01700820
    Computer Graphics
    Raytracer
*/

"use strict";

var bounce_depth, shadow_bias, canvas, context, image_buffer, filepath, scene, camera, surfaces, materials, lights, DEBUG = !1, EPSILON = 1e-6, BG = [0, 0, 0];

// Initialize canvas.

function init() {
    canvas = $("#canvas")[0], context = canvas.getContext("2d"), image_buffer = context.createImageData(canvas.width, canvas.height)
}

// Load scene to file.

function loadSceneFile(param) {
    scene = Utils.loadJSON(param), camera = new Camera(scene.camera.eye, scene.camera.at, scene.camera.up, scene.camera.fovy, scene.camera.aspect), bounce_depth = scene.bounce_depth ? scene.bounce_depth : 0, shadow_bias = scene.shadow_bias ? scene.shadow_bias : EPSILON, extractLights(scene), extractSurfaces(scene), extractMaterials(scene)
}

// Light management.

function extractLights(param) {
    for (var obj of(lights = [], param.lights)) "Ambient" === obj.source ? lights.push(new AmbientLight(obj.source, obj.color)) : "Directional" === obj.source ? lights.push(new DirectionalLight(obj.source, obj.color, obj.direction)) : "Point" === obj.source ? lights.push(new PointLight(obj.source, obj.color, obj.position)) : console.error("Invalid light source: " + obj.source)
}

// Surface management.

function extractSurfaces(param) {
    for (var obj of(surfaces = [], param.surfaces)) "Sphere" === obj.shape ? surfaces.push(new Sphere(obj.material, obj.center, obj.radius, obj.name, obj.transforms)) : "Triangle" === obj.shape ? surfaces.push(new Triangle(obj.material, obj.p1, obj.p2, obj.p3, obj.name, obj.transforms)) : console.error("Invalid shape: " + obj.shape)
}

// Material management.

function extractMaterials(param) {
    for (var obj of(materials = [], param.materials)) materials.push(new Material(obj.name, obj.shininess, obj.ka, obj.kd, obj.ks, obj.kr))
}

// Camera object.

var Camera = function(e, t, r, i, o) {
    this.eye = (new THREE.Vector3).fromArray(e), this.at = (new THREE.Vector3).fromArray(t), this.up = (new THREE.Vector3).fromArray(r), this.wVec = (new THREE.Vector3).subVectors(this.eye, this.at).normalize(), this.uVec = (new THREE.Vector3).crossVectors(this.up, this.wVec).normalize(), this.vVec = (new THREE.Vector3).crossVectors(this.wVec, this.uVec).normalize(), this.fovy = i, this.aspect = o, this.halfCameraHeight = Math.tan(this.fovy * Math.PI / 360), this.halfCameraWidth = this.halfCameraHeight * this.aspect, this.cameraWidth = 2 * this.halfCameraWidth, this.cameraHeight = 2 * this.halfCameraHeight, this.pixelHeight = this.cameraHeight / (canvas.height - 1), this.pixelWidth = this.cameraWidth / (canvas.width - 1)
};

// Light object.

var Light = function(e, t) {
    this.source = e, this.color = t
};

// Ambient light object.

var AmbientLight = function(e, t) {
    Light.call(this, e, t)
};

// Point light object.

var PointLight = function(e, t, r) {
    Light.call(this, e, t), this.position = (new THREE.Vector3).fromArray(r)
};

// Direction light object.

var DirectionalLight = function(e, t, r) {
    Light.call(this, e, t), this.direction = (new THREE.Vector3).fromArray(r).normalize().negate()
};

// Material object.

var Material = function(e, t, r, i, o, a) {
    this.name = e, this.shininess = t, this.ka = r, this.kd = i, this.ks = o, this.kr = a
};

// Surface object.

var Surface = function(e, t, r) {
    if (this.material = e, this.objname = t, this.transformations = new THREE.Matrix4, r)
        for (var i of r) {
            var o = i[1][0],
                a = i[1][1],
                n = i[1][2];
            "Translate" === i[0] ? this.transformations.multiply((new THREE.Matrix4).makeTranslation(o, a, n)) : "Scale" === i[0] ? this.transformations.multiply((new THREE.Matrix4).makeScale(o, a, n)) : "Rotate" === i[0] && this.transformations.multiply((new THREE.Matrix4).makeRotationX(o)).multiply((new THREE.Matrix4).makeRotationY(a)).multiply((new THREE.Matrix4).makeRotationZ(n))
        }
};

// Sphere object.

var Sphere = function(e, t, r, i, o) {
    Surface.call(this, e, i, o), this.center = (new THREE.Vector3).fromArray(t), this.radius = r
};

// Triangle object.

var Triangle = function(e, t, r, i, o, a) {
    Surface.call(this, e, o, a), this.p1 = (new THREE.Vector3).fromArray(t), this.p2 = (new THREE.Vector3).fromArray(r), this.p3 = (new THREE.Vector3).fromArray(i)
};

// Render pixels and calculate time.

function render() {
    var start_time = Date.now();
    for (var t = 0; t < canvas.width; t++)
        for (var r = 0; r < canvas.height; r++)
            renderPoint(t, r);
    context.putImageData(image_buffer, 0, 0);
    var end_time = Date.now();
    $("#log").html("Rendered in: " + (end_time - start_time) + "ms"), console.log("Rendered in: " + (end_time - start_time) + "ms")
}

// Auxiliary function called from render.

function renderPoint(x, y) {
    var c = [0, 0, 0];
    var ray = camera.castRay(x + (Math.random()), y + (Math.random()));
    var c = trace(ray, 0);

    c[0] = c[0] + c[0];
    c[1] = c[1] + c[1];
    c[2] = c[2] + c[2];

    if (x == canvas.width/2 && y == canvas.height/2 ){
        console.log("EL COLOR DEL CENTRO ES");
        console.log("R: " + 255 * c[0]);
        console.log("G: " + 255 * c[1]);
        console.log("B: " + 255 * c[2]);
    }

    setPixel(x, y, c);
}

function trace(e, t) {
    if (t > bounce_depth) return BG;
    var r = closestSurface(e);
    if (null === r.surface) return BG;
    var i = r.surface, o = r.intersection, a = i.normal(o), n = materials[i.material];
    var c = 0, s = 0, l = 0;
    if (n.kr) {
        var h = null, u = i.reflection(e);
        null !== u && (h = trace(u, t + 1)), null !== h && (c = n.kr[0] * h[0] + (1 - n.kr[0]) * c, s = n.kr[1] * h[1] + (1 - n.kr[1]) * s, l = n.kr[2] * h[2] + (1 - n.kr[2]) * l)
    }
    for (var f of lights) {
        if (f instanceof AmbientLight) c += n.ka[0] * f.color[0], s += n.ka[1] * f.color[1], l += n.ka[2] * f.color[2];
        else if (f instanceof PointLight) {
            i instanceof Triangle && a.angleTo(f.directionTo(o)) < Math.PI / 2 && a.negate();
            for (var d = (new THREE.Vector3).copy(a).multiplyScalar(shadow_bias).add(o), m = f.directionTo(d), E = m.clone().negate(), p = (new THREE.Vector3).set(-1, 1, (m.x - m.y) / m.z).normalize(), g = (new THREE.Vector3).crossVectors(m, p).normalize(), w = 0, V = 0; V < 1; V++) {
                var T = Math.random() - .5,
                    y = Math.random() - .5,
                    v = {
                        origin: d,
                        direction: (new THREE.Vector3).copy(E).add(p.clone().multiplyScalar(T)).add(g.clone().multiplyScalar(y)).normalize()
                    };
                (L = closestSurface(v)).distance < d.distanceTo(f.position) * (1 + EPSILON) && w++
            }
            var H = 1 - w / 1,
                R = (new THREE.Vector3).subVectors(v.direction, e.direction).normalize(),
                b = Math.max(0, a.dot(v.direction)),
                S = Math.pow(Math.max(0, a.dot(R)), n.shininess),
                k = n.kd[0] * f.color[0] * b,
                x = n.kd[1] * f.color[1] * b,
                M = n.kd[2] * f.color[2] * b;
            c += (k + (P = n.ks[0] * f.color[0] * S)) * H, s += (x + (z = n.ks[1] * f.color[1] * S)) * H, l += (M + (A = n.ks[2] * f.color[2] * S)) * H, DEBUG && console.log("Point light added:"), DEBUG && console.log([k + P, x + z, M + A])
        } else if (f instanceof DirectionalLight) {
            i instanceof Triangle && a.angleTo(f.directionTo(o)) < Math.PI / 2 && a.negate();
            var L, _ = {
                    origin: d = (new THREE.Vector3).copy(a).multiplyScalar(shadow_bias).add(o),
                    direction: E = f.directionTo(d).negate()
                },
                D = !0;
            if ((L = closestSurface(_)).distance === 1 / 0 && (D = !1), D) DEBUG && console.log("Directional light obscured by:"), DEBUG && console.log(L);
            else {
                var P, z, A;
                R = (new THREE.Vector3).subVectors(_.direction, e.direction).normalize(), b = Math.max(0, a.dot(_.direction)), S = Math.pow(Math.max(0, a.dot(R)), n.shininess), k = n.kd[0] * f.color[0] * b, x = n.kd[1] * f.color[1] * b, M = n.kd[2] * f.color[2] * b;
                c = c + k + (P = n.ks[0] * f.color[0] * S), s = s + x + (z = n.ks[1] * f.color[1] * S), l = l + M + (A = n.ks[2] * f.color[2] * S), DEBUG && console.log("Directional light added:"), DEBUG && console.log([k + P, x + z, M + A])
            }
        }
    }
    return [c, s, l]
}

// Calculate closest object to any given point.

function closestSurface(e) {
    var t = null,
        r = null,
        i = 1 / 0;
    for (var o of surfaces) {
        var a = o.intersects(e);
        if (null !== a) {
            var n = e.origin.distanceTo(a);
            if (0 < n && n < i) t = o, r = a, i = n
        }
    }
    return {
        surface: t,
        intersection: r,
        distance: i
    }
}

// Pixel management.

function setPixel(e, t, r) {
    var i = 4 * (t * image_buffer.width + e);
    image_buffer.data[i] = 255 * r[0] | 0, image_buffer.data[i + 1] = 255 * r[1] | 0, image_buffer.data[i + 2] = 255 * r[2] | 0, image_buffer.data[i + 3] = 255;
}

// Cast camera's ray.

Camera.prototype.castRay = function(e, t) {
    var r = e * this.pixelWidth - this.halfCameraWidth,
        i = this.halfCameraHeight - t * this.pixelHeight,
        o = (new THREE.Vector3).copy(this.uVec).multiplyScalar(r),
        a = (new THREE.Vector3).copy(this.vVec).multiplyScalar(i),
        n = (new THREE.Vector3).addVectors(o, a);
    return {
        origin: this.eye,
        direction: (new THREE.Vector3).copy(this.wVec).negate().add(n).normalize()
    }
};

// Calculate sphere normal.

Sphere.prototype.normal = function(param) {
    return (new THREE.Vector3).subVectors(param, this.center).normalize()
};

// Calculate sphere's intersections.

Sphere.prototype.intersects = function(param) {
    var t = (new THREE.Vector3).copy(param.direction),
        r = (new THREE.Vector3).copy(param.origin),
        i = this.center,
        o = this.radius,
        a = t.dot(t),
        n = t.dot((new THREE.Vector3).subVectors(r, i).multiplyScalar(2)),
        c = n * n - 4 * a * (i.dot(i) + r.dot(r) - 2 * r.dot(i) - o * o);
    if (c < 0) return null;
    var s = ((c = Math.sqrt(c)) + n) / (-2 * a);
    if (0 < s) {
        Math.sqrt(a);
        var l = (new THREE.Vector3).copy(t).multiplyScalar(s).add(r);
        (new THREE.Vector3).subVectors(l, i).multiplyScalar(1 / o).normalize();
        return l
    }
    return null
};

// Calculate sphere's reflection.

Sphere.prototype.reflection = function(param) {
    var t = this.intersects(param),
        r = this.normal(t);
    return {
        origin: t,
        direction: (new THREE.Vector3).copy(r).multiplyScalar(2 * r.dot(param.direction)).sub(param.direction).negate()
    }
};


// Calculate triangle's normal.

Triangle.prototype.normal = function(param) {
    var t = (new THREE.Vector3).subVectors(this.p3, this.p1),
        r = (new THREE.Vector3).subVectors(this.p2, this.p1);
    return (new THREE.Vector3).crossVectors(t, r).normalize()
};

// Calculate triangle's intersects.

Triangle.prototype.intersects = function(param) {
    var t = (new THREE.Vector3).subVectors(this.p2, this.p1),
        r = (new THREE.Vector3).subVectors(this.p3, this.p1),
        i = (new THREE.Vector3).crossVectors(param.direction, r),
        o = t.dot(i);
    if (-EPSILON < o && o < EPSILON) return null;
    var a = 1 / o,
        n = (new THREE.Vector3).subVectors(param.origin, this.p1),
        c = n.dot(i) * a;
    if (1 < c || c < 0) return null;
    var s = (new THREE.Vector3).crossVectors(n, t),
        l = a * param.direction.dot(s);
    if (1 < c + l || l < 0) return null;
    var h = a * r.dot(s);
    return EPSILON < h ? (new THREE.Vector3).copy(param.direction).multiplyScalar(h).add(param.origin) : null
};

// Calculate triangle's reflections.

Triangle.prototype.reflection = function(param) {
    var t = this.intersects(param),
        r = this.normal(t),
        i = (new THREE.Vector3).copy(r).multiplyScalar(2 * r.dot(t)).sub(t).normalize().multiplyScalar(t.length()).negate();
    return {
        origin: t,
        direction: i
    }
};

// Calculate point light's direction.

PointLight.prototype.directionTo = function(param) {
    return (new THREE.Vector3).subVectors(param, this.position).normalize()
};

// Calculate directional light's direction.

DirectionalLight.prototype.directionTo = function(param) {
    return (new THREE.Vector3).copy(this.direction).negate().normalize()
};

// Load scene.

$(document).ready(function() {
    init(), loadSceneFile("assets/CornellBox.json"), render(), $("#load_scene_button").click(function() {
        filepath = "assets/" + $("#scene_file_input").val() + ".json", console.log("Starting rendering of: " + filepath), loadSceneFile(filepath), render()
    }), $("#canvas").click(function(e) {
        var t = e.pageX - $("#canvas").offset().left,
            r = e.pageY - $("#canvas").offset().top;
        DEBUG = !0, renderPoint(t, r), DEBUG = !1
    })
});
