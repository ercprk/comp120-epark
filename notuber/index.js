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
    currentLocationPosition = new google.maps.LatLng({ lat: 42.352271, lng: -71.05524200000001 });
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
        zoom: 3
    });

    // Current geolocation
    navigator.geolocation.getCurrentPosition((position) => {
        currentLocationPosition = new google.maps.LatLng({ lat: position.coords.latitude, lng: position.coords.longitude });
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
                var posLatLng = new google.maps.LatLng({ lat: element["lat"], lng: element["lng"] });

                element["distance"] = google.maps.geometry.spherical.computeDistanceBetween(currentLocationPosition, posLatLng) * 0.000621371192;  // in miles

                var marker = new google.maps.Marker({
                    position: posLatLng,
                    icon: carIcon,
                    map: map
                });
        
                markers.push(marker);
            });

            // Get closest vehicle
            const closestVehicle = vehicles.reduce(function(prev, curr) {
                return prev["distance"] < curr["distance"] ? prev : curr;
            });

            // Infowindow on click
            currentLocationMarker.addListener("click", () => {
                const contentString =
                    '<div id="content">' +
                    '<h3>closest vehicle</h3>' +
                    "<li>username: <strong>" + closestVehicle["username"] + "</strong></li>" +
                    "<li>id: <strong>" + closestVehicle["id"] + "</strong></li>" +
                    "<li>latitude: <strong>" + closestVehicle["lat"] + "</strong></li>" +
                    "<li>longitude: <strong>" + closestVehicle["lng"] + "</strong></li>" +
                    "<li>distance away: <strong>" + closestVehicle["distance"] + " miles</strong></li>" +
                    "</ul>" +
                    "</div>";
                const infowindow = new google.maps.InfoWindow({
                    content: contentString
                });
                infowindow.open({
                    anchor: currentLocationMarker,
                    map: map,
                    shouldFocus: false
                });
            });

            // Polyline
            const pathCoordinates = [
                { lat: currentLocationPosition.lat(), lng: currentLocationPosition.lng() },
                { lat: closestVehicle['lat'], lng: closestVehicle['lng'] }
            ];
            const closestVehiclePolyline = new google.maps.Polyline({
                path: pathCoordinates,
                geodesic: true,
                strokeColor: "#FF0000",
                strokeOpacity: 1.0,
                strokeWeight: 2,
            });
            closestVehiclePolyline.setMap(map);
        }
    };
    xhr.responseType = "json";
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.send('username=gDL4eabb&lat=' + currentLocationPosition.lat() + "&lng=" + currentLocationPosition.lng());
}