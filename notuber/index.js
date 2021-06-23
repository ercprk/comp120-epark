/* Author: Eric Park */

let map;
let currentLocationPosition;

let currentLocationMarker;

let carIcon;
let currentLocationIcon;

var vehicles = new Array();
var markers = new Array();

vehicles.push({"id": "mXfkjrFw", "latitude": 42.3453, "longitude": -71.0464});
vehicles.push({"id": "nZXB8ZHz", "latitude": 42.3662, "longitude": -71.0621});
vehicles.push({"id": "Tkwu74WC", "latitude": 42.3603, "longitude": -71.0547});
vehicles.push({"id": "5KWpnAJN", "latitude": 42.3472, "longitude": -71.0802});
vehicles.push({"id": "uf5ZrXYw", "latitude": 42.3663, "longitude": -71.0544});
vehicles.push({"id": "VMerzMH8", "latitude": 42.3542, "longitude": -71.0704});

function initMap() {
    carIcon = {
        url: "./images/car.png",
        scaledSize: new google.maps.Size(20, 40)
    };
    currentLocationIcon = {
        url: "./images/current_location.png",
        scaledSize: new google.maps.Size(40, 40)
    };

    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 42.352271, lng: -71.05524200000001 },
        zoom: 14
    });

    vehicles.forEach((element, index, array) => {
        var marker = new google.maps.Marker({
            position: { lat: element["latitude"], lng: element["longitude"] },
            icon: carIcon,
            map: map
        });

        markers.push(marker);
    });

    // Current geolocation
    navigator.geolocation.getCurrentPosition((position) => {
        currentLocationPosition = { lat: position.coords.latitude, lng: position.coords.longitude };
        map.setCenter(currentLocationPosition);
        currentLocationMarker = new google.maps.Marker({
            position: currentLocationPosition,
            icon: currentLocationIcon,
            map: map
        });
    });
}