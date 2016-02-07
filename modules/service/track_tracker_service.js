var playlist_service = require("./playlist_service");
var song_to_playlist = require("../storage/song_to_playlist");

var start_new_track = function(playlistid) {
    playlist_service.get_next_song_from_playlist(playlistid, function(song) {
        song_to_playlist.update_song_to_playlist(playlistid, song);
    });
}

var get_currently_playing_info = function(playlistid, callback) {

    console.log("Getting currently playing song, playlist: ", playlistid);

    song_to_playlist.get_currently_playing_song(playlistid, function(song) {
        callback(song);
    });
}

var pause_playlist = function(playlist_id) {
    console.log("track_tracker_service: Pausing playlist: ", playlist_id);
    song_to_playlist.pause_playlist(playlist_id);
}

var resume_playlist = function(playlist_id) {
    console.log("track_tracker_service: Resuming playlist: ", playlist_id);
    song_to_playlist.resume_playlist(playlist_id);
}

module.exports.start_new_track = start_new_track;
module.exports.pause_playlist = pause_playlist;
module.exports.resume_playlist = resume_playlist;
module.exports.get_currently_playing_info = get_currently_playing_info;