/*global angular*/

angular.module('starter.controllers')

.config(['$provide', function($provide){

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

.factory('User', ['$q', '$rootScope', function($q, $rootScope) {
  return {
    get: function() {
      return {
        username: window.localStorage['username'],
        password: window.localStorage['password'],
        email: this.getEmail(),
        session: this.getSession(),
        loggedIn: this.hasLoggedIn(),
        speechRecognition: this.useSpeechRecognition(),
      };
    },
    set: function(username, password, session, email) {
      window.localStorage['username'] = username;
      window.localStorage['password'] = password;
      this.setEmail(email);
      this.setSession(session);
    },
    getSession: function() {
      return window.localStorage['session'] || "";
    },
    setSession: function(session) {
      if (session !== undefined && session !== null && session.length) {
        window.localStorage['session'] = session;
        //$cookies.koc_session = session;
      }
    },
    setEmail: function(email) {
      if(email!==undefined&&email.length)
        window.localStorage['email'] = email;
    },
    getEmail: function() {
      return window.localStorage['email'] || "";
    },
    getCacheSize: function() {
      var total= 0;
      for(var x in localStorage) {
        if( x.indexOf("cache_")>=0)
          total += localStorage[x].length;
      }
      total = total*2/1024;
      return total;
    },
    validateEmail: function(email) {
      var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(email);
    },
    // setBase: function(user) {
    //   window.localStorage['base'] = JSON.stringify(user);
    // },
    // getBase: function() {
    //   return JSON.parse(window.localStorage['base']);
    // },
    setLoggedIn: function(loggedIn) {
      window.localStorage['loggedIn'] = !! loggedIn;
    },
    hasLoggedIn: function() {
      return window.localStorage['loggedIn']=="true" || false;
    },
    setSpeechRecognition: function(speechRecognition) {
      window.localStorage['speechRecognition'] = !! speechRecognition;
    },
    useSpeechRecognition: function() {
      return window.localStorage['speechRecognition']=="true" || false;
    },
    setPageRetrieved: function(page, data) {
        if(page!==undefined&&page.length&&data!==undefined){
            var localStorageKey = this.getLsKeyForPage(page);
            if( data.timestamp===undefined || typeof(data.timestamp)!="number" )
                data.timestamp = +new Date(); // if the server didn't provide a timestamp, set it
            window.localStorage[localStorageKey] = JSON.stringify(data);
        }
    },
    getPageRetrievedTime: function(page) {
        var desiredLocalStorageKey = this.getLsKeyForPage(page);
        var cache = window.localStorage[desiredLocalStorageKey];
        if(cache!==undefined) {
            cache = JSON.parse(cache);
            return cache.timestamp;
        }
        return 0;
    },
    getSecondsSincePageRetrieved: function(page) {
        var pageRetrievedAt = this.getPageRetrievedTime(page);
        var timeNow = +new Date();
        var seconds = (timeNow - pageRetrievedAt)/1000;
        console.log("Page " + page + " has been loaded " + seconds + " seconds ago");
        return seconds;
    },
    getLsKeyForPage: function(page) {
        return "cache_" + page.toString();
    },
    clearCache: function(pattern) {
      for(var key in localStorage)
      {
          if( key.indexOf("cache_") === 0 // starts by cache_ and either no pattern or matches the pattern
                && ( pattern===undefined || pattern===null || ( pattern.length && key.indexOf(pattern)>=0 ) ) ) {
            window.localStorage.removeItem( key );
          }
      }
      console.log("Cache cleared");
    },
    showAdvisor: function() {
      if(window.localStorage.showAdvisor === undefined) {
        this.setShowAdvisor(true);
        console.log("initializing showAdvisor to True");
        return true;
      }
      var showAdvisor = window.localStorage.showAdvisor == "true";
      console.log("showAdvisor in localStorage: ", showAdvisor);
      return showAdvisor;
    },
    setShowAdvisor: function(showAdvisor) {
      showAdvisor = !!showAdvisor;
      console.log("setting showAdvisor to ", showAdvisor);
      window.localStorage.setItem('showAdvisor', showAdvisor);
      $rootScope.$broadcast('kocShowAdvisor', showAdvisor);
    },
    isCacheAvailable: function(page, maxTimeInSeconds) {
      var cache = window.localStorage[this.getLsKeyForPage(page)];
      if( cache === undefined )
        return false;
      if( maxTimeInSeconds === undefined || maxTimeInSeconds === null || maxTimeInSeconds < 0)
        return true;
      return this.getSecondsSincePageRetrieved(page) <= maxTimeInSeconds;
    },
    // getCacheDirect returns an object/array
    getCacheDirect: function(page, maxTimeInSeconds) {
      if( this.isCacheAvailable( page, maxTimeInSeconds ) ) {
        var cache = JSON.parse(window.localStorage[this.getLsKeyForPage(page)]);
        $rootScope.$broadcast('kocAdvisor', cache.help);
        return cache;
      }
      return null;
    },
    // getCache returns a Promise
    getCache: function(page, maxTimeInSeconds) {
        if(maxTimeInSeconds===undefined)
            maxTimeInSeconds = 60; // 60 seconds default cache
        console.log("User.getCache("+page+","+maxTimeInSeconds+")");
        var defer = $q.defer();
        var p = defer.promise;
        var cache = this.getCacheDirect(page, maxTimeInSeconds);
        defer.resolve(cache);
        return p;
    }
  };
}]);