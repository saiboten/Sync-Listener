var track_tracker_service = require("../service/track_tracker_service");
var database = [];

var update_song_to_playlist = function(playlist_id, song) {
    console.log("Adding this playlist/song to list: ", playlist_id, song);
    database.push({playlistid: playlist_id, song: song, playing: true});
    console.log("database now contains: ", database);
}

var pause_playlist = function(playlist_id) {
    get_currently_playing_song(playlist_id,function(playlist) {
        playlist.playing = false;
    });
}

var playlist_is_playing = function(playlist_id) {
    return database.filter(function(playlist) {
        return playlist.playlistid === playlist_id;
    }).length==1;
}

var resume_playlist = function(playlist_id) {
    if(playlist_is_playing(playlist_id)) {
        get_currently_playing_song(playlist_id,function(playlist) {
            playlist.playing = true;
        });
    }
    else {
        track_tracker_service.start_new_track(playlist_id);
    }
}

var get_currently_playing_song = function(playlist_id, callback) {
    console.log("Getting currently playing song: ", database);
    if(database.length == 0) {
        console.log("The list is empty? No song play..");
        callback();
        return;
    }
    callback(database.filter(function(playlist) {
        return playlist.playlistid === playlist_id;
    }).reduce(function() {}));
}

var tick = function() {
    database.forEach(function(playlist) {
        if(playlist.playing) {
            playlist.song.secondsPlayed = playlist.song.secondsPlayed+1;
            if(playlist.song.secondsPlayed > playlist.song.songDurationMs) {
                console.log("Wow! Playlist has exeeded the time, time to play new song", playlist.playlistid);

                console.log("Database before deletion: ", database);

                database = database.filter(function(elem) {
                    return elem.playlistid != playlist.playlistid;
                });

                console.log("Database after deletion: ", database);
                track_tracker_service.start_new_track(playlist.playlistid);
            }
        }
    });
}

setInterval(tick, 1000);

module.exports.update_song_to_playlist = update_song_to_playlist;
module.exports.get_currently_playing_song = get_currently_playing_song;
module.exports.resume_playlist = resume_playlist;
module.exports.pause_playlist = pause_playlist;
