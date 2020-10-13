function generateBuilding(data, area, projCoords) {
    let pts = data.features[0].geometry.coordinates;
    console.log(pts);
    console.log(area);
    console.log(projCoords);
    // customLayer();
}

var box = (map, mbxContext) => {
    tb = new Threebox(map, mbxContext, { defaultLights: true });

    // initialize geometry and material of our cube object
    var geometry = new THREE.BoxGeometry(2, 2, 2);

    var redMaterial = new THREE.MeshPhongMaterial({
        color: 0x009900,
        side: THREE.DoubleSide,
    });

    var cube = new THREE.Mesh(geometry, redMaterial);

    cube = tb.Object3D({ obj: cube }).setCoords(projCoordinates);

    tb.add(cube);

    return tb;
};
