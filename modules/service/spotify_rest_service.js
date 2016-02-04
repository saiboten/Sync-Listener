/**
 * Created by Tobias on 21.09.2014.
 */
var Song = require("../model/song");
var https = require("https");

var uri_to_song = function(uri, callback) {
    //artist, name, album, uri
    var song = undefined;

    console.log("This is the complete uri: ", "https://api.spotify.com/v1/tracks/" + uri.substring(14));

    https.get("https://api.spotify.com/v1/tracks/" + uri.substring(14), function(res) {
        console.log("Got response: " + res.statusCode);

        res.on('data', function (chunk) {
            console.log("Data recieved: ", chunk);
            var chunkJson = JSON.parse(chunk);
            song = new Song(chunkJson.artists[0].name, chunkJson.name, chunkJson.album["name"], uri, Math.floor(chunkJson.duration_ms/1000));
            callback(song);
        });

    }).on('error', function(e) {
        console.log("Got error: " + e.message);
    });
}

module.exports.uri_to_song = uri_to_song;