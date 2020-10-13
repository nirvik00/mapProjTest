let projAddress = "1815 Clement Ave, Alameda, CA 94501";
let projCoordinates = [-122.250366, 37.776733];

mapboxgl.accessToken =
    "pk.eyJ1IjoibmlydmlrIiwiYSI6ImNrZnl3dGZrdjA2eHYyeW8xZnc3eDYyNG0ifQ.Rkte6h3OBvW9KaFJi2rAeA";

var map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v11",
    center: projCoordinates,
    zoom: 15,
    pitch: 45,
    bearing: -17.6,
    container: "map",
    antialias: true,
});

var geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl,
});

map.addControl(geocoder, "top-left");

map.on("load", function () {
    //listen to user input address & redirect map
    geocoder.on("result", function (ev) {
        /* var styleSpec = ev.result; */
        let coords = ev.result.geometry.coordinates;
        let placeName = ev.result.place_name;
        projCoordinates = coords;
        console.log(coords, placeName);
        add3dObject();
    });
    loadBuildings();
});

var draw = new MapboxDraw({
    displayControlsDefault: false,
    controls: {
        polygon: true,
        trash: true,
    },
});

// draw using turf //
map.addControl(draw);

map.on("draw.create", updateArea);
map.on("draw.delete", updateArea);
map.on("draw.update", updateArea);

///////////////////////////////

// parameters to ensure the model is georeferenced correctly on the map
var modelOrigin = projCoordinates;
var modelAltitude = 0;
var modelRotate = [Math.PI / 2, 0, 0];

var modelAsMercatorCoordinate = mapboxgl.MercatorCoordinate.fromLngLat(
    modelOrigin,
    modelAltitude
);

// transformation parameters to position, rotate and scale the 3D model onto the map
var modelTransform = {
    translateX: modelAsMercatorCoordinate.x,
    translateY: modelAsMercatorCoordinate.y,
    translateZ: modelAsMercatorCoordinate.z,
    rotateX: modelRotate[0],
    rotateY: modelRotate[1],
    rotateZ: modelRotate[2],
    scale: modelAsMercatorCoordinate.meterInMercatorCoordinateUnits(),
};

//////////////////////////////

function loadBuildings() {
    var layers = map.getStyle().layers;
    var labelLayerId;
    for (var i = 0; i < layers.length; i++) {
        if (layers[i].type === "symbol" && layers[i].layout["text-field"]) {
            labelLayerId = layers[i].id;
            break;
        }
    }
    map.addLayer(
        {
            id: "3d-buildings",
            source: "composite",
            "source-layer": "building",
            filter: ["==", "extrude", "true"],
            type: "fill-extrusion",
            minzoom: 15,
            paint: {
                "fill-extrusion-color": "#aaa",

                // use an 'interpolate' expression to add a smooth transition effect to the
                // buildings as the user zooms in
                "fill-extrusion-height": [
                    "interpolate",
                    ["linear"],
                    ["zoom"],
                    15,
                    0,
                    15.05,
                    ["get", "height"],
                ],
                "fill-extrusion-base": [
                    "interpolate",
                    ["linear"],
                    ["zoom"],
                    15,
                    0,
                    15.05,
                    ["get", "min_height"],
                ],
                "fill-extrusion-opacity": 0.6,
            },
        },
        labelLayerId
    );
}

function updateArea(e) {
    var data = draw.getAll();
    var answer = document.getElementById("calculated-area");
    if (data.features.length > 0) {
        var area = turf.area(data);
        // restrict to area to 2 decimal points
        var rounded_area = Math.round(area * 100) / 100;
        answer.innerHTML =
            "<p><strong>" + rounded_area + "</strong></p><p>square meters</p>";
        // generateBuilding(data, area, projCoordinates);
    } else {
        answer.innerHTML = "";
        if (e.type !== "draw.delete")
            alert("Use the draw tools to draw a polygon!");
    }
}

//////////////////////////////

var THREE = window.THREE;

//////////////////////////////

map.on("style.load", function () {
    let tb;
    map.addLayer({
        id: "custom_layer",
        type: "custom",
        onAdd: function (map, mbxContext) {
            tb = box(map, mbxContext);
        },

        render: function (gl, matrix) {
            tb.update();
        },
    });
});
