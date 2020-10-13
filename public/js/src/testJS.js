var __mapcenter__ = [116.582, 35.415];
mapboxgl.accessToken =
    "pk.eyJ1IjoiaG91eGlleXUiLCJhIjoiY2pldjE5amU3NndzeDM5bzd5bm9ncDgycyJ9.j1F-Lgid3L5k2Abm8_xTeQ";

var mapboxgl_style = "mapbox://styles/mapbox/dark-v10";
var tb;
function addTB(mapd, gl) {
    tb = new Threebox(mapd, gl, { defaultLights: true });
    var sphere = tb
        .sphere({ radius: 1, color: "red", material: "MeshStandardMaterial" })
        .setCoords(__mapcenter__.concat([500]));
    // add sphere to the scene
    tb.add(sphere);
}
const linetype = 0; //0=normal 1=fat
// var map = myChart.getModel().getComponent('mapbox3D').getMapbox();
var map = new mapboxgl.Map({
    container: "map",
    style: mapboxgl_style,
    zoom: 16,
    center: __mapcenter__,
    pitch: 20,
    antialias: true, // create the gl context with MSAA antialiasing, so custom layers are antialiased
});

$.ajaxSettings.async = false;
var linesdata;
$.getJSON("jp4data.json", function (res) {
    linesdata = res;
});
// configuration of the custom layer for a 3D model per the CustomLayerInterface
function initThree(_this, mapd) {
    _this.camera = new THREE.Camera();
    _this.scene = new THREE.Scene();
    // create two three.js lights to illuminate the model
    // var directionalLight = new THREE.DirectionalLight(0xffffff);
    // directionalLight.position.set(0, -70, 100).normalize();
    // this.scene.add(directionalLight);

    // var directionalLight2 = new THREE.DirectionalLight(0xffffff);
    // directionalLight2.position.set(0, 70, 100).normalize();
    // this.scene.add(directionalLight2);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    _this.scene.add(directionalLight);
    _this.map = mapd;
}
var lineGroup;
var mbpt = mapboxgl.MercatorCoordinate.fromLngLat(__mapcenter__, 0);
var threescale = mbpt.meterInMercatorCoordinateUnits();
var customLayer = {
    id: "3d-model",
    type: "custom",
    renderingMode: "3d",
    onAdd: function (mapd, gl) {
        initThree(this, mapd);
        addTB(mapd, gl);
        //绘制光源
        addLight(this.scene);
        //绘制飞线
        // drawLines(this.scene);
        //绘制建筑物
        // drawBuildings(this.scene);
        this.renderer = new THREE.WebGLRenderer({
            canvas: mapd.getCanvas(),
            antialias: true,
            alpha: true,
            context: gl,
            antialias: true,
        });

        this.renderer.autoClear = false;
    },
    render: function (gl, matrix) {
        // updateLight();
        tb.update();
        // updateLines();
        this.camera.projectionMatrix = new THREE.Matrix4().fromArray(matrix); // m.multiply(l);
        this.renderer.state.reset();
        this.renderer.render(this.scene, this.camera);
        this.map.triggerRepaint();
    },
};

map.on("style.load", function () {
    addMapboxExtrudeLayer();
    map.addLayer(customLayer);
});
// used to determine the switch point for the light animation
var invert = 1;
var phase = 0;
var pointColor, pointLight, sphereLight, sphereLightMaterial, sphereLightMesh;
function addLight(scene) {
    scene.add(new THREE.AmbientLight(0xffffff));
    var sunlight = new THREE.DirectionalLight(0xffffff, 0.25);
    sunlight.position.set(0, 80000000, 100000000);
    sunlight.matrixWorldNeedsUpdate = true;
    scene.add(sunlight);

    pointColor = "#ccffcc";
    pointLight = new THREE.PointLight(pointColor);
    pointLight.distance = 0.1;
    scene.add(pointLight);
    var pt = mapboxgl.MercatorCoordinate.fromLngLat(__mapcenter__, 600);
    var met = pt.meterInMercatorCoordinateUnits();
    // add a small sphere simulating the pointlight
    sphereLight = new THREE.SphereBufferGeometry(30, 120, 120);
    sphereLightMaterial = new THREE.MeshStandardMaterial({ color: 0xac6c25 });
    sphereLightMesh = new THREE.Mesh(sphereLight, sphereLightMaterial);
    // sphereLightMesh.castShadow = true;

    sphereLightMesh.position.set(pt.x, pt.y, pt.z);
    sphereLightMesh.scale.set(threescale, threescale, threescale);
    console.log(sphereLightMesh);
    scene.add(sphereLightMesh);
}
/**
 * @desc 经纬度转换成墨卡托投影
 * @param {array} 传入经纬度
 * @return array [x,y,z]
 */
function lnglatToMector(lnglat) {
    var pt = mapboxgl.MercatorCoordinate.fromLngLat(lnglat, 0);
    const { x, y, z } = pt;
    return [x, y, z];
}

function mercatorConvert(fts) {
    fts.forEach((d) => {
        d.vector3 = [];
        d.geometry.coordinates.forEach((coordinates, i) => {
            d.vector3[i] = [];
            coordinates.forEach((c, j) => {
                if (c[0] instanceof Array) {
                    d.vector3[i][j] = [];
                    c.forEach((cinner) => {
                        let cp = lnglatToMector0(cinner);
                        d.vector3[i][j].push(cp);
                    });
                } else {
                    let cp = lnglatToMector0(c);
                    d.vector3[i].push(cp);
                }
            });
        });
    });
}
/**
 * @desc 
 */
function drawModel(points) {
    // console.log(points)
    const shape = new THREE.Shape();
    points.forEach((d, i) => {
        const [x, y] = d;
        if (i === 0) {
            shape.moveTo(x, y);
        } else if (i === points.length - 1) {
            shape.quadraticCurveTo(x, y, x, y);
        } else {
            shape.lineTo(x, y, x, y);
        }
    });

    var extrudeSettings = {
        depth: -0.01,
        bevelEnabled: false,
    };
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

    // var material = new THREE.MeshPhongMaterial( { color: 0x156289, emissive: 0x072534,  } );
    const material = new THREE.MeshBasicMaterial({
        color: "#006de0",
        // transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide,
    });

    var mesh = new THREE.Mesh(geometry, material);
    return mesh;
}
var projection;
function lnglatToMector0(lnglat) {
    if (!projection) {
        projection = d3
            .geoMercator()
            .center([116.582, 35.415])
            .scale(800)
            // .rotate(Math.PI / 4)
            .translate([0.75, 0.7]);
    }
    const [y, x] = projection([...lnglat]);
    let z = 0;
    return [x, y, z];
}

var shines = [];

var colors = ["#FF6666", "#FFFF00", "#0066CC"];

function addMapboxExtrudeLayer() {
    map.addSource("buildings", {
        type: "vector",
        url: "mapbox://houxieyu.as833g2t",
    });
    map.addLayer({
        id: "3dbuildings",
        source: "buildings",
        "source-layer": "jiningbuildings-7kbdau",
        type: "fill-extrusion",
        minzoom: 0,
        paint: {
            "fill-extrusion-height": ["get", "height"],
            "fill-extrusion-color": [
                "case",
                ["to-boolean", ["feature-state", "cc"]],
                [
                    "case",
                    ["feature-state", "shine"],
                    ["feature-state", "cc"],
                    colors[2],
                ],
                colors[2],
            ],
        },
    });
    initShine();
    var ystimer = setInterval(function () {
        shines.forEach(function (id) {
            var state = map.getFeatureState({
                id: id,
                source: "buildings",
                sourceLayer: "jiningbuildings-7kbdau",
            });
            state.delay += 1;
            if (state.shine) {
                if (state.delay > 4) {
                    state.delay = 0;
                    state.shine = false;
                    // state.cc = colors[2];
                }
            } else {
                if (state.delay > 2) {
                    state.delay = 0;
                    state.shine = true;
                }
            }
            map.setFeatureState(
                {
                    id: id,
                    source: "buildings",
                    sourceLayer: "jiningbuildings-7kbdau",
                },
                state
            );
        });
    }, 200);
}

var curfts = [];
map.on("data", "3dbuildings", function () {
    // curfts = map.queryRenderedFeatures('buildings');
});

function initShine() {
    shines = [];
    var maxid = 10000;
    for (let i = 0, l = maxid / 20; i < l; i++) {
        let inx = Math.floor(Math.random() * maxid);
        shines.push(inx);
        map.setFeatureState(
            {
                id: inx,
                source: "buildings",
                sourceLayer: "jiningbuildings-7kbdau",
            },
            {
                cc: colors[Math.floor(Math.random() * 2)],
                delay: Math.floor(Math.random() * 4),
                shine: true,
            }
        );
    }
}
