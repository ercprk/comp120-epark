// Author: Eric Park

const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5000;

var bodyParser = require('body-parser');
var app = express();
var validator = require('validator');

var sample = '[{"_id":"5cdf411856e9c200042989d7","username":"JANET","lat":42.354951,"lng":-71.0509,"created_at":"2020-05-17T23:17:44.427Z"},{"_id":"5cf583aafbbfe80004456918","username":"mXfkjrFw","lat":42.3453,"lng":-71.0464,"created_at":"2020-06-03T20:31:38.378Z"},{"_id":"5cf583aafbbfe80004456919","username":"nZXB8ZHz","lat":42.3662,"lng":-71.0621,"created_at":"2020-06-03T20:31:38.611Z"},{"_id":"5cf583aafbbfe8000445691a","username":"Tkwu74WC","lat":42.3603,"lng":-71.0547,"created_at":"2020-06-03T20:31:38.786Z"},{"_id":"5cf583aafbbfe8000445691b","username":"5KWpnAJN","lat":42.3472,"lng":-71.0802,"created_at":"2020-06-03T20:31:38.932Z"},{"_id":"5cf583abfbbfe8000445691c","username":"uf5ZrXYw","lat":42.3663,"lng":-71.0544,"created_at":"2020-06-03T20:31:39.077Z"},{"_id":"5cf583acfbbfe8000445691d","username":"VMerzMH8","lat":42.3542,"lng":-71.0704,"created_at":"2020-06-03T20:31:40.400Z"}]';

const { Pool } = require('pg');
const pg = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});
pg.connect();
pg.query('CREATE TABLE IF NOT EXISTS vehicles (id SERIAL PRIMARY KEY, username TEXT NOT NULL, lat FLOAT NOT NULL, lng FLOAT NOT NULL, created_on TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP);', (error, result) => {});
pg.query('CREATE TABLE IF NOT EXISTS riderequests (id SERIAL PRIMARY KEY, username TEXT NOT NULL, lat FLOAT NOT NULL, lng FLOAT NOT NULL, created_on TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP);', (error, result) => {});

const { uniqueNamesGenerator, adjectives, colors, animals } = require('unique-names-generator');

/* Generate random vehicles
for (var i = 0; i < 2000; i++) {
    var username = uniqueNamesGenerator({ dictionaries: [adjectives, colors, animals] });
    var lat = Math.random() * (90.0 - -90.0) + -90.0;
    var lng = Math.random() * (180.0 - -180.0) + -180.0;

    console.log(username + ' ' + lat + ' ' + lng); 

    pg.query('INSERT INTO vehicles (username, lat, lng) VALUES ($1, $2, $3)', [username, lat, lng], (error, result) => {});
}
*/

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    var indexPage = '';

    res.set('Content-Type', 'text/html');
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    pg.query('SELECT * FROM riderequests;', (error, result) => {
        if (!error) {
            indexPage += '<!DOCTYPE HTML><html lang="en"><head><title>notuber API</title></head><body><h1>Ride Requests (Passengers)</h1>';
            for (var count = 0; count < result.rows.length; count++) {
                var row = result.rows[count];
                indexPage += "<p>id: " + row.id + ' || username: ' + row.username + ' || lat: ' + row.lat + ' || lng: ' + row.lng + ' || created_on: ' + row.created_on + "</p>";
            }
            pg.query('SELECT * FROM vehicles;', (error_, result_) => {
                if (!error_) {
                    indexPage += '<h1>Vehicles</h1>';
                    for (var count = 0; count < result_.rows.length; count++) {
                        var row = result_.rows[count];
                        indexPage += "<p>id: " + row.id + ' || username: ' + row.username + ' || lat: ' + row.lat + ' || lng: ' + row.lng + ' || created_on: ' + row.created_on + "</p>";
                    }
                    indexPage += "</body></html>"
                    res.send(indexPage);
                } else {
                    res.send(500);
                }
            });
        }
        else {
            res.send(500);
        }
    });
});

app.post('/rides', (req, res) => {
    var username = req.body.username;
    var lat = req.body.lat;
    var lng = req.body.lng;

    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    if (username != undefined && 
        validator.isFloat(lat, { min: -90.0, max: 90.0 }) &&
        validator.isFloat(lng, { min: -180.0, max: 180.0 })) {
        pg.query('INSERT INTO riderequests (username, lat, lng) VALUES ($1, $2, $3);', [username, lat, lng], (error, result) => {
            if (!error) {
                pg.query('SELECT * FROM vehicles ORDER BY RANDOM() LIMIT 20;', (error_, result_) => {
                    res.send(result_.rows);
                });
            } else {
                res.send(500);
            }
        });
    } else {
        res.send('{"error":"Whoops, something is wrong with your data!"}');
    }
});
app.post('/checkin', (req, res) => {
    var username = req.body.username;
    var lat = req.body.lat;
    var lng = req.body.lng;

    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    if (username != undefined && 
        validator.isFloat(lat, { min: -90.0, max: 90.0 }) &&
        validator.isFloat(lng, { min: -180.0, max: 180.0 })) {
        console.log(username + lat + lng);
        pg.query('INSERT INTO vehicles (username, lat, lng) VALUES ($1, $2, $3);', [username, lat, lng], (error, result) => {
            if (!error) {
                res.send(201);
            } else {
                res.send(500);
            }
        });
    }
});

app.get('/passenger.json', (req, res) => {
    var username = req.query.username;

    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    if (username != undefined && username != "") {
        pg.query('SELECT * FROM riderequests WHERE username=\'' + username + '\';', (error, result) => {
            if (!error) {
                res.send(result.rows);
            } else {
                res.send(500);
            }
        });
    } else {
        res.send('[]');
    }
});

app.get('/vehicle.json', (req, res) => {
    var username = req.query.username;

    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    if (username != undefined && username != "") {
        pg.query('SELECT * FROM vehicles WHERE username=\'' + username + '\';', (error, result) => {
            if (!error) {
                res.send(result.rows);
            } else{
                res.send(500);
            }
        });
    } else {
        res.send('[]');
    }
});

app.listen(PORT, () => console.log(`Listening on ${ PORT }`));
