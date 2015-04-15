/**
 * Created by Tobias on 04.10.2014.
 */

var playlist_repo = require("./playlistrepo");

var add_track_to_playlist = function(playlist_id, song, callback) {
    console.log("songrepo:: Adding song ", song, " to playlist ", playlist_id);
    song_exists_in_playlist(playlist_id, song, function(exists) {
        if(exists) {
            callback(false);
        }
        else {
            playlist_repo.get_playlist(playlist_id, function(playlist) {
                console.log("songrepo:: Found playlist: ", playlist);
                if(playlist) {
                    playlist.songs.unshift(song);
                    playlist_repo.save_playlist(playlist, function() {
                        callback(true);
                    });
                }
            });
        }
    })
}

var delete_track_from_playlist = function(playlist_id, song, callback) {
    console.log("songrepo:: Deleting song ", song, " from playlist ", playlist_id);

    playlist_repo.get_playlist(playlist_id, function(playlist) {
        //console.log("songrepo:: Found playlist: ", playlist);
        if(playlist) {

            console.log("Playlist songs length: ", playlist.songs.length);
            for(var i = 0; i < playlist.songs.length; i++) {
                var elem = playlist.songs[i];

                if(elem.uri == song.uri) {
                    console.log("songrepo:: Found song to delete: ", elem);
                    playlist.songs.splice(i,1);

                    console.log("Songs after splice: ", playlist.songs);
                    playlist_repo.save_playlist(playlist, function() {
                        callback(true);
                    });
                    break;
                }
            }
        }
    });
}

var song_exists_in_playlist = function(playlist_id, songInput, callback) {

    playlist_repo.get_playlist(playlist_id, function(playlist) {
        var exists = false;
        if(playlist) {
            playlist.songs.forEach(function(song) {
                if(songInput.uri == song.uri) {
                    exists = true;
                }
            });
        }

        console.log("songrepo:: Callback time!: ", exists);
        callback(exists);
    });
}

module.exports.add_track_to_playlist = add_track_to_playlist;
module.exports.delete_track_from_playlist = delete_track_from_playlist;