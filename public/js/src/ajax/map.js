/* 
var map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v11",
    zoom: 15,
    center: [-71.10971, 42.37365],
});

// fetch stores from API
async function getStores() {
    const res = await fetch("/api/v1/stores");
    const data = await res.json();
    console.log(data);

    const stores = data.data.map((store) => {
        return {
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [
                    store.location.coordinates[0],
                    store.location.coordinates[1],
                ],
            },
            properties: {
                storeId: store.storeId,
                icon: "shop",
            },
        };
    });
    LoadMap(stores);
}

// load map with stores
function LoadMap(stores) {
    map.on("load", function () {
        map.addLayer({
            id: "points",
            type: "symbol",
            source: {
                type: "geojson",
                data: {
                    type: "FeatureCollection",
                    features: stores,
                },
            },
            layout: {
                "icon-image": "{icon-15}",
                "icon-size": 1.5,
                "text-field": "{storeId}",
                "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
                "text-offset": [0, 0.9],
                "text-anchor": "top",
            },
        });
    });
}

getStores();
 */
