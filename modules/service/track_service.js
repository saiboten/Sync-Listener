/**
 * Created by Tobias on 04.10.2014.
 */

var spotify_rest_service = require("./spotify_rest_service");
var song_repo = require("../storage/songrepo");
var websocket = require("../websocket/socket");
var playlist_service = require("./playlist_service");
var track_tracker_service = require("./track_tracker_service");

var add_track_to_playlist = function (playlist_id, track_id, userid, callback) {
    spotify_rest_service.uri_to_song(track_id, function (song) {
        song.addedby = userid;
        song_repo.add_track_to_playlist(playlist_id, song, function (success) {
            if (success) {
                websocket.time_to_update();
            }
            callback(success);
        })
    });
}

var delete_song = function (playlist_id, uri, req, callback) {
    console.log("track_service:: Deleting track, playlistid: ", playlist_id, ", uri for song to delete: " + uri);
    playlist_service.get_playlist(playlist_id, function (playlist) {
        playlist.songs.forEach(function (song) {
            if (song.uri == uri) {
                song_repo.delete_track_from_playlist(playlist_id, song, function () {
                    console.log("track_service:: Success! Track was deleted? ");
                    websocket.time_to_update();
                });
            }
        });


    });
    callback(true);
    return true;
}

module.exports.add_track_to_playlist = add_track_to_playlist;
module.exports.delete_song = delete_song;