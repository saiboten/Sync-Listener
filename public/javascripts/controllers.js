
var phonecatApp = angular.module('testApp', ['ui.bootstrap', 'ngRoute']);

phonecatApp.config(['$routeProvider',
function($routeProvider) {
  $routeProvider.
    when('/search', {
      templateUrl: '../partials/search.html',
      controller: 'SearchController'
    }).
    when('/playlist', {
      templateUrl: '../partials/playlist.html',
      controller: 'PlaylistController'
    }).
    when('/about', {
        templateUrl: '../partials/about.html',
        controller: 'AboutController'
      }).
    otherwise({
      redirectTo: '/playlist'
    });
}]);


/**
 * Search Controller!
 */
phonecatApp.controller('SearchController', function ($scope, $http, $timeout, $modal) {
	
	$scope.method = 'GET';
	$scope.theUrl = 'https://api.spotify.com/v1/search?type=track&q=';
	$scope.addTrackUrl = '/add/'
	$scope.playlist = Spotocracy.playlist;
    $scope.track = undefined;
	
	$scope.delayedClearStatus = function() {
		$timeout(function() {
			$scope.status = "";
			$scope.error = "";
		},5000)
	}
	
	$scope.addTrack = function(track) {
        $scope.track = track;
		var fullUrl = $scope.addTrackUrl + $scope.playlist + "/" + track;
		console.log("Full url:", fullUrl);
		
		 $http({method: $scope.method, url: fullUrl , cache: false}).
		    success(function(data, status) {
		    	if(status == 200) {
		    		console.log("data", data);
                    if(data.success) {
                        $scope.error = "";
                        $scope.open();
                    }
                    else {
                        $scope.status = "";
                        $scope.error = "Låten finnes allerede i spillelisten";
                    }

		    		 //$scope.tracks = undefined;
		    	}
		    	else {
		    		$scope.error = "Låt ble ikke lagt til?";
		    	}
		    }).
		    error(function(data, status) {
		    	$scope.error = "Noe gikk fryktelig galt:" + status;
		  });
		 
		 $scope.delayedClearStatus();
		
	}
	
	$scope.searchSpotify = function() {
		console.log("Which playlist? ", $scope.playlist);
		
	  $scope.code = null;
	  $scope.response = null;
	  
	  if(!$scope.searchKeyword) {
		  $scope.error = "Du må skrive inn et søkeord";
	  }
	  else {
          $scope.status = "Søker ...";
		  $http({method: $scope.method, url: $scope.theUrl + $scope.searchKeyword, cache: false}).
		    success(function(data, status) {
              console.log(data.tracks);
		      $scope.tracks = data.tracks;
		      $scope.error = undefined;
              $scope.status = "";

              if(data.tracks.length == 0) {
                  $scope.status = "Fant ingen låter som passet";
              }
		    }).
		    error(function(data, status) {
		      $scope.data = data || "Request failed";
		      $scope.error = status;
              $scope.status = "";
		  });
	  }
	};

    $scope.open = function () {

        console.log($scope.tracks);

        var modalInstance = $modal.open({
            templateUrl: '../html/test.html',
            controller: 'ModalInstanceCtrl',
            size: 'sm',
            resolve: {
                track: function () {
                    var songFound = undefined;

                    console.log($scope.track);

                    $scope.tracks.items.forEach(function(song) {
                        if($scope.track == song.uri) {
                            console.log("GOT IT!: ", song);
                            songFound = song;
                        }
                    })

                    return songFound;
                }
            }
        });
    };
});
/**
 * Playlist Controller!
 */
phonecatApp.controller('PlaylistController', function ($scope, $http, $interval, $timeout) {

    function pad(n, width, z) {
        z = z || '0';
        n = n + '';
        return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
    }

    $scope.Math = window.Math;

	$scope.method = 'GET';
	$scope.getSongsUri = '/get_current_songs/';
    $scope.pauseUri = '/pause/';
    $scope.resumeUri = '/resume/';
    $scope.playingSongUri = '/get_song/';
		
	$scope.boostMethod = 'POST';
	$scope.boostTrackUri = '/boost/';

    $scope.deleteMethod = 'POST';
    $scope.deleteTrackUri = '/delete/';

	$scope.playlist = Spotocracy.playlist;
	$scope.totalVotes = 0;
	$scope.selectedSong = undefined;
    $scope.username = undefined;
    $scope.songDuration = 0;
    $scope.songDurationString = "0";
    $scope.secondsPlayed = 0;
    $scope.secondsPlayedString = "0";

    $scope.currentPage = 1;
    $scope.totalItems = 0;

    $scope.setPage = function (pageNo) {
        $scope.currentPage = pageNo;
        $scope.updatePlaylist();
    };
	
	$scope.delayedClearStatus = function() {
		$timeout(function() {
			$scope.result = "";
			$scope.error = "";
		},5000)
	}
	
	$scope.updatePlaylist = function() {
		console.log("Lets update the playlist!");
		 $http({method: $scope.method, url: $scope.getSongsUri + $scope.playlist + "/" + $scope.currentPage, cache: false}).
		    success(function(data, status) {
		    	console.log("data", data);
		    	$scope.userVotes = data.userVotes;
		    	$scope.songs = data.songData.songs;
                $scope.totalItems = data.songData.totalSongs;
                $scope.username = data.username;

		    	if(data.playingSong)  {
		    		$scope.currentArtist = data.playingSong.artist;
			    	$scope.currentSong = data.playingSong.name;
		    	}
		    	
		    	$scope.totalVotes = data.totalVotes;
		    	
		    	console.log("User votes: ", $scope.userVotes);
                 $scope.playingSong();
		    }).
		    error(function(data, status) {
		    	$scope.error = "Noe gikk fryktelig galt:" + status;
		    	$scope.delayedClearStatus();
		  });	
	};


    $scope.playingSong = function() {
        console.log("Lets get info about playing song playlist!");
        $http({method: $scope.method, url: $scope.playingSongUri + $scope.playlist, cache: false}).
            success(function(data, status) {
                console.log("data", data);
                if(data.success) {
                    $scope.songDuration = data.song.song.songDurationMs;
                    $scope.songDurationString = pad((Math.floor($scope.songDuration/60)),2) + ":" + pad(($scope.songDuration%60),2)
                    $scope.secondsPlayed = data.song.song.secondsPlayed;
                    $scope.secondsPlayedString = pad((Math.floor($scope.secondsPlayed/60)),2) + ":" + pad(($scope.secondsPlayed%60),2);
                }
            }).
            error(function(data, status) {

            });
    }

    $scope.pause = function() {
        console.log("Lets pause playlist!");
        $http({method: $scope.method, url: $scope.pauseUri + $scope.playlist, cache: false}).
            success(function(data, status) {
                console.log("data", data);
                $scope.result = "Playlist satt på pause";
                $scope.delayedClearStatus();
            }).
            error(function(data, status) {
                $scope.error = "Noe gikk fryktelig galt:" + status;
                $scope.delayedClearStatus();
            });
    }

    $scope.resume = function() {
        console.log("Lets resume playlist!");
        $http({method: $scope.method, url: $scope.resumeUri + $scope.playlist, cache: false}).
            success(function(data, status) {
                $scope.result = "Playlist spiller av";
                console.log("data", data);
            }).
            error(function(data, status) {
                $scope.error = "Noe gikk fryktelig galt:" + status;
                $scope.delayedClearStatus();
            });
    }
	
	$scope.boostTrack = function(song) {
		console.log("Lets boost this track: ", song);
		$scope.selectedSong = song;
		var fullUri = $scope.boostTrackUri + $scope.playlist + "/" + song.uri;
		
		 $http({method: $scope.boostMethod, url: fullUri, cache: false}).
		    success(function(data, status) {
		    	if(status == 200) {
		    		if(data.alreadyvoted) {
		    			$scope.error = "Du har brukt opp stemmene dine.";
		    		}
		    		else {
		    			$scope.result = "";		    			
		    		}
		    		
		    		$scope.updatePlaylist();
		    	}
		    	else {
		    		$scope.error = "Noe gikk galt :(!";
		    	}
		    	
		    }).
		    error(function(data, status) {
		    	$scope.error = "Noe gikk fryktelig galt:" + status;
		  });
		 
		 $scope.delayedClearStatus();
	}

    $scope.deleteTrack = function(song) {
        console.log("Lets delete this track: ", song);
        $scope.selectedSong = song;
        var fullUri = $scope.deleteTrackUri + $scope.playlist + "/" + song.uri;

        $http({method: $scope.deleteMethod, url: fullUri, cache: false}).
            success(function(data, status) {
                if(status == 200) {
                    $scope.result = "";
                    $scope.updatePlaylist();
                }
                else {
                    $scope.error = "Noe gikk galt :(!";
                }

            }).
            error(function(data, status) {
                $scope.error = "Noe gikk fryktelig galt:" + status;
            });

        $scope.delayedClearStatus();
    }

    var sock = new SockJS('/socket');
    sock.onmessage = function(e) {
        console.log("Received message: ", e)
        if(e.data === "Update") {
            $scope.updatePlaylist();
        }
    };

    $scope.updatePlaylist();
    $scope.playingSong();

    $interval(function() {
        $scope.secondsPlayed = $scope.secondsPlayed+1;
        $scope.secondsPlayedString = pad(Math.floor(($scope.secondsPlayed/60)),2) + ":" + pad((Math.floor($scope.secondsPlayed%60)),2);

        if($scope.secondsPlayed > $scope.songDuration) {
            $scope.playingSong();
        }
    }, 1000);
});

/**
 * Menu Controller!
 */
phonecatApp.controller('MenuController', function ($scope, $location, $modal, $log) {
	
	$scope.isCollapsed = true;
	
	$scope.getClass = function(path) {
	    if ($location.path().substr(0, path.length) == path) {
	      return "active"
	    } 
	    else {
	      return ""
	    }
	}

    $scope.open = function () {
        var modalInstance = $modal.open({
            templateUrl: '../html/test.html',
            controller: 'ModalInstanceCtrl'
        });

        modalInstance.result.then(function (username) {
            $scope.username = username;
            $log.info('Username is: ', username);
        }, function () {
            $log.info('Cancelled! NO YOU CANT CANCEL!!!');
        });
    }
	
});

phonecatApp.controller('ModalInstanceCtrl', function ($scope, $modalInstance, track) {

    $scope.track = track;

    $scope.ok = function () {
        $modalInstance.close();
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});

phonecatApp.controller('AboutController', function ($scope, $location) {
	
	$scope.oneAtATime = true;

	  $scope.groups = [
	    {
	      title: 'Hvordan får jeg poeng?',
	      content: 'Du får automatisk 1 poeng hvert femte minutt.'
	    },
	    {
	      title: 'Hvordan stemmer jeg på en låt?',
	      content: 'Enkelt! Bare klikk på den.'
	    },
	    {
	      title: 'Hvordan legger jeg til en låt?',
	      content: 'Gå på søk, skriv inn det du søker etter, og klikk på sangen du vil legge til'
	    },
	    {
	      title: 'Hvordan spiller jeg av låtene?',
	      content: 'Dette gjøres vha en avspillerapp. Den krever at du er Spotify Premium-bruker. Mer info TBA'
	    },
	    {
	      title: 'Kan jeg ha flere spillelister?',
	      content: 'Ja, du kan ha så mange spillelister du vil. Bare velg bytt spilleliste og skriv inn noe som ikke finnes fra før'
	    }
	  ];
});
	

phonecatApp.controller('RootController', function ($scope, $location, $http) {
	
	$http({method: "GET", url: "/playlists" , cache: false}).
	    success(function(data, status) {
	    	console.log("Data:", data);
	    	$scope.playlists = data.playlists;
	    }).
	    error(function(data, status) {
	    	console.log("Error:", data);
	  });	
	
	
	$scope.getPlaylist = function(view) {
		return $scope.playlists.filter(function(playlist) {
			var re = new RegExp(view, 'gi');
			return playlist.match(re);
		});
	}
	
	$scope.clicked = function() {
		console.log("Changing url to ", $scope.url);
		window.location = '/p/' + $scope.url;
	}
});

phonecatApp.controller('UsernameController', function ($scope, $http) {
    $scope.method = 'POST';
    $scope.usernameUrl = 'username/'
    $scope.error = undefined;

    $scope.usernameEntered = function (username) {
        console.log("Scope username: ", username);

        var fullUrl = $scope.usernameUrl + username ;

        $http({method: $scope.method, url: fullUrl , cache: false}).
            success(function(data) {
                if(data.success) {
                    window.location.reload();
                }
                else if(data.error == "userid_taken"){
                    $scope.error = "Brukernavn tatt. Velg et annet brukernavn!";
                }
                else {
                    $scope.error = data.error;
                }
            }).
            error(function(data, status) {
                $scope.error = "Noe gikk fryktelig galt:" + status;
            });
    };
});
