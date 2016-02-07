/**
 * Created by Tobias on 21.09.2014.
 */
var Playlist = function(playlist_id, spotocracy) {
    this.current_song = undefined,
    this.playlist_id = playlist_id;
    this.scores = 0;
    this.songs = [];
    this.users = [];
    this.spotocracy = spotocracy;
}

module.exports = Playlist;