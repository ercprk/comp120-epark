/* Author: Eric Park */

let map;

// Positions
let currentLocationPosition;

// Markers
let currentLocationMarker;

// Icons
let carIcon;
let currentLocationIcon;

let vehicles;
let markers = new Array();

function initMap() {
    // Prelim
    currentLocationPosition = { lat: 42.352271, lng: -71.05524200000001 };
    carIcon = {
        url: "./images/car.png",
        scaledSize: new google.maps.Size(20, 40)
    };
    currentLocationIcon = {
        url: "./images/current_location.png",
        scaledSize: new google.maps.Size(40, 40)
    };

    map = new google.maps.Map(document.getElementById("map"), {
        center: currentLocationPosition,
        zoom: 2
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
        callRideHailingAPI();
    });

}

function callRideHailingAPI() {
    var xhr;
    xhr = new XMLHttpRequest();
    xhr.open("POST", "https://jordan-marsh.herokuapp.com/rides", true);
    xhr.onreadystatechange = function () {
        if (this.readyState == this.DONE && this.status == 200) {
            vehicles = this.response;
            vehicles.forEach((element, index, array) => {
                var marker = new google.maps.Marker({
                    position: { lat: element["lat"], lng: element["lng"] },
                    icon: carIcon,
                    map: map
                });
        
                markers.push(marker);
            });
        }
    };
    xhr.responseType = "json";
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.send('username=gDL4eabb&lat=' + currentLocationPosition.lat + "&lng=" + currentLocationPosition.lng);
}