/* Author: Eric Park */

let map;

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat:  42.352271, lng: -71.05524200000001 },
        zoom: 15
    });
}