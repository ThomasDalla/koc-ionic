/*global angular,Ionic*/

angular.module('koc.services' )

  .config(['$provide', function ($provide) {

    // Add success/error to $q promises
    // Source: http://stackoverflow.com/questions/16797209
    $provide.decorator('$q', function ($delegate) {
      var defer = $delegate.defer;
      $delegate.defer = function () {
        var deferred = defer();
        deferred.promise.success = function (fn) {
          deferred.promise.then(function (value) {
            fn(value);
          });
          return deferred.promise;
        };
        deferred.promise.error = function (fn) {
          deferred.promise.then(null, function (value) {
            fn(value);
          });
          return deferred.promise;
        };
        return deferred;
      };
      return $delegate;
    });

  }])

  .factory('User', ['$q', '$rootScope', '$log', '$ionicAnalytics', function ($q, $rootScope, $log, $ionicAnalytics) {
    return {
      get: function () {
        return {
          username: window.localStorage['username'],
          password: window.localStorage['password'],
          email: this.getEmail(),
          session: this.getSession(),
          loggedIn: this.hasLoggedIn(),
          speechRecognition: this.useSpeechRecognition(),
        };
      },
      set: function (username, password, session, email) {
        window.localStorage['username'] = username;
        window.localStorage['password'] = password;
        this.setEmail(email);
        this.setSession(session);
      },
      getSession: function () {
        return window.localStorage['session'] || "";
      },
      setSession: function (session) {
        if (session !== undefined && session !== null && session.length) {
          window.localStorage['session'] = session;
        }
      },
      setBattlefieldMaxPage: function (maxPage) {
        if (maxPage !== undefined)
          window.localStorage['battlefieldMaxPage'] = maxPage;
      },
      getBattlefieldMaxPage: function () {
        return window.localStorage['battlefieldMaxPage'] || "???";
      },
      setEmail: function (email) {
        if (email !== undefined && email.length)
          window.localStorage['email'] = email;
      },
      getEmail: function () {
        return window.localStorage['email'] || "";
      },
      showBestWeaponsOnly: function (newValue) {
        if(newValue===undefined) {
          var val = window.localStorage['showBestWeaponsOnly'];
          return val == "true";
        }
        window.localStorage['showBestWeaponsOnly'] = newValue;
      },
      setAge: function (age) {
        if (age !== undefined && age.length)
          window.localStorage['kocAge'] = age;
      },
      getAge: function () {
        return window.localStorage['kocAge'] || 0;
      },
      getCacheSize: function () {
        var total = 0;
				for(var i=0; i<localStorage.length; i++) {
					var key = localStorage.key(i);
					if(key.indexOf("cache_")>=0){
						total += localStorage.getItem(key).length;
					}
				}
        total = total * 2 / 1024;
        return total;
      },
			cleanupOldCache : function(seconds) {
				if(seconds==null||seconds==undefined){
					seconds = 60*60*24*7; //1w
				}
				var now = +new Date();
				var cachesToDelete = [];
				for(var i=0; i<localStorage.length; i++) {
					var key = localStorage.key(i);
					if(key.indexOf("cache_")>=0){
						try {
							var cache = JSON.parse(localStorage[key]);
							var cacheTime = cache.timestamp;
							if ((now - cacheTime) > seconds) {
								cachesToDelete.push(key);
							}
						}
						catch (e){
							$log.error("Error checking cache " + key);
						}
					}
				}
				if(cachesToDelete.length>0) {
					$log.debug("Deleting " + cachesToDelete.length + " old caches");
					cachesToDelete.forEach(function (key) {
						localStorage.removeItem(key);
					});
				}
			},
      validateEmail: function (email) {
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
      },
			getIonicUser: function(){
				var currentUser =  null;
				try {
					currentUser = Ionic.User.current();
				}
				catch(e){
					$log.error("Error getting current Ionic user:", e);
					currentUser = null;
				}
				return currentUser;
			},
      // setBase: function(user) {
      //   window.localStorage['base'] = JSON.stringify(user);
      // },
      // getBase: function() {
      //   return JSON.parse(window.localStorage['base']);
      // },
      setLoggedIn: function (loggedIn) {
        window.localStorage['loggedIn'] = !!loggedIn;
				if(!!loggedIn){
					// try {
					// 	// Save the user
					// 	var user = this.getIonicUser();
					// 	if(user!=null) {
					// 		user.id = this.get().username;
					// 		user.save().then(function () {
					// 			$log.debug("Saved user: " + user.id);
					// 		}, function (err) {
					// 			$log.error("Failed saving user " + user.id, err);
					// 		});
					// 	}
					// }
					// catch(e){
					// 	$log.error("An error occurred saving the user:", e);
					// }
					// Send a login event
					this.track('User Login'); // username is always injected
				}
      },
			track: function(actionName, data){
				try {
					if(data==null||data==undefined||typeof(data)!="object")
						data = {};
					data.username = this.get().username;
					$ionicAnalytics.track(actionName, data);
				} catch(ex){
					$log.error("Error tracking the event [" + actionName +"]", ex);
				}
			},
      hasLoggedIn: function () {
        return window.localStorage['loggedIn'] == "true" || false;
      },
      setSpeechRecognition: function (speechRecognition) {
        window.localStorage['speechRecognition'] = !!speechRecognition;
      },
      useSpeechRecognition: function () {
        return window.localStorage['speechRecognition'] == "true" || false;
      },
      setPageRetrieved: function (page, data) {
        if (page !== undefined && page.length && data !== undefined) {
          var localStorageKey = this.getLsKeyForPage(page);
          if (data.timestamp === undefined || typeof(data.timestamp) != "number")
            data.timestamp = +new Date(); // if the server didn't provide a timestamp, set it
          window.localStorage[localStorageKey] = JSON.stringify(data);
					var location = page;
					var pageSplit = page.split("/");
					if(pageSplit.length>1){
						location = pageSplit[1];
					}
					this.track('Page Retrieved', {
						location: location
					});
        }
      },
      getPageRetrievedTime: function (page) {
        var desiredLocalStorageKey = this.getLsKeyForPage(page);
        var cache = window.localStorage[desiredLocalStorageKey];
        if (cache !== undefined) {
          cache = JSON.parse(cache);
          return cache.timestamp;
        }
        return 0;
      },
      getSecondsSincePageRetrieved: function (page) {
        var pageRetrievedAt = this.getPageRetrievedTime(page);
        var timeNow = +new Date();
        var seconds = (timeNow - pageRetrievedAt) / 1000;
        $log.debug("Page " + page + " has been loaded " + seconds + " seconds ago");
        return seconds;
      },
      getLsKeyForPage: function (page) {
        return "cache_" + page.toString();
      },
      clearCache: function (pattern) {
        for (var key in localStorage) {
					if (key.indexOf("cache_") === 0 // starts by cache_ and either no pattern or matches the pattern
            && ( pattern === undefined || pattern === null || ( pattern.length && key.indexOf(pattern) >= 0 ) )) {
            window.localStorage.removeItem(key);
          }
        }
        $log.debug("Cache cleared");
      },
      showAdvisor: function () {
        if (window.localStorage.showAdvisor === undefined) {
          this.setShowAdvisor(true);
          $log.debug("initializing showAdvisor to True");
          return true;
        }
        var showAdvisor = window.localStorage.showAdvisor == "true";
        $log.debug("showAdvisor in localStorage: ", showAdvisor);
        return showAdvisor;
      },
      setShowAdvisor: function (showAdvisor) {
        showAdvisor = !!showAdvisor;
        $log.debug("setting showAdvisor to ", showAdvisor);
        window.localStorage.setItem('showAdvisor', showAdvisor);
        $rootScope.$broadcast('kocShowAdvisor', showAdvisor);
      },
      // getCache
      getCache: function (page, maxTimeInSeconds) {

        if (maxTimeInSeconds === undefined || maxTimeInSeconds === null)
          maxTimeInSeconds = 60; // 60 seconds default cache
        $log.debug("User.getCache(" + page + "," + maxTimeInSeconds + ")");

        var cache = window.localStorage[this.getLsKeyForPage(page)];
        if (cache === undefined) {
          cache = null;
        }
        else if (
          maxTimeInSeconds < 0 ||
          this.getSecondsSincePageRetrieved(page) <= maxTimeInSeconds
        ) {
          // valid cache
          cache = JSON.parse(cache);
          if( page != "/races" ) {
            $rootScope.$broadcast('kocAdvisor', cache.help);
            $log.debug( "broadcasted help from cache page " + page );
          }
        }
        else {
          // old cache
          cache = null;
        }

        return cache;
      },
			setChannel: function(newValue){
				window.localStorage["channel"] = newValue;
			},
			getChannel: function(){
				var channel = window.localStorage["channel"];
				if(channel!==undefined && channel!==null && channel.length>0)
					return channel;
				return "production";
			}
    };
  }])
;
