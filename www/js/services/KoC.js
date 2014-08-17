/*global angular*/

const KOC_API = "https://koc-api.herokuapp.com/api";
var apiPage = function(page) {
  return KOC_API + page;
};

angular.module('starter.controllers')

.config(['$httpProvider', function($httpProvider, User){

  // HTTP interceptor
  $httpProvider.interceptors.push(function($q, $injector, $rootScope, User) {
    return {
      'response': function(response) {
        // Middleware that catches responses from the API
        if(response!==undefined&&typeof(response.data)=="object") {
            // Set the session (if present)
            User.setSession(response.data.session);
            if (response.data.success === true) {
              console.log("success!");
              // Record that we retrieved that page
              var split = response.config.url.split(KOC_API);
              var location = split[split.length-1];
              if( response.data.stats !== undefined && response.data.stats.gold != "???" ) {
                console.log("broadcasting kocStats");
                $rootScope.$broadcast('kocStats', response.data.stats);
                User.setPageRetrieved("stats", response.data.stats);
              }
              if( response.data.help !== undefined) {
                console.log("broadcasting kocAdvisor");
                $rootScope.$broadcast('kocAdvisor', response.data.help);
              }
              if(response.data.commanderChange !== undefined && response.data.commanderChange.success) {
                $rootScope.$broadcast('kocChangeCommanderInfo', response.data.commanderChange);
              }
              console.log("setting page retrieved: " + location);
              User.setPageRetrieved(location, response.data);
              return response;
            }
            else if( response.config.loginAndRetry === true && User.hasLoggedIn()
              && response.data.location!==undefined && response.data.location.indexOf("error.php")>=0
              && response.data.error.indexOf("Please login to view that page")>=0
            ) {
              // try to reconnect, and reload the request
              console.log("try to re-login and then retry the request before propagating");
              var user = User.get();
              var originalRequestConfig = response.config;
              var KoC = $injector.get('KoC');
              var $http = $injector.get('$http');
              return KoC.login(user.username, user.password).then(function(r){
                if(r.success)
                  return $http(originalRequestConfig);
                var defer = $q.defer();
                var p = defer.promise;
                defer.resolve(r);
                return p;
              });
            }
        }
        // propagate the response
        return response;
      }
    };
  });

}])

.factory('KoC', ['$http', 'User', function($http, User) {
  return {
    getRaces: function(cacheTimeInSeconds) {
      return this.getPage("GET", "/races", {}, cacheTimeInSeconds);
    },
    getUserStats: function(userid, cacheTimeInSeconds) {
      return this.getPage("GET", "/stats/"+userid, {}, cacheTimeInSeconds, true);
    },
    changeRace: function(new_race) {
      return this.getPage("POST", "/changeRace", { new_race: new_race}, 0, true);
    },
    getBase: function(cacheTimeInSeconds) {
      return this.getPage("GET", "/base", {}, cacheTimeInSeconds, true);
    },
    getHelp: function(cacheTimeInSeconds) {
      return this.getPage("GET", "/help", {}, cacheTimeInSeconds);
    },
    getChangeCommanderInfo: function() {
      return this.getPage("GET","/changeCommanderInfo", {}, 0, true);
    },
    changeCommander: function(userid) {
      return this.getPage("POST", "/changeCommander", {
        new_commander_id: userid,
        password: User.get().password
      }, 0, true );
    },
    ditchCommander: function() {
      return this.getPage("POST", "/ditchCommander", {
        password: User.get().password
      }, 0, true );
    },
    getPage: function(method, page, data, cacheTimeInSeconds, loginAndRetry) {

      // cacheTime:
      //   -1 : return the cache if it exists, no matter how old it is
      //    0 : never return the cache
      //  positive number: return the cache if not older than the given number (in seconds)

      // Booleanize loginAndRetry
      loginAndRetry = !! loginAndRetry;

      // Get from cache if requested and available
      if( cacheTimeInSeconds !== undefined && cacheTimeInSeconds !== null && cacheTimeInSeconds !== 0 ) {
        console.log("checking " + page + " from the cache...");
        if(User.isCacheAvailable(page, cacheTimeInSeconds)) {
          console.log("Cache available, loading it");
          return User.getCache(page, cacheTimeInSeconds);
        }
      }

      var session = User.getSession();
      return $http({
        method: method,
        url: apiPage(page),
        data: data,
        headers: {
          'X-KoC-Session': session
        },
        loginAndRetry: loginAndRetry
      });
    },
    forgotLogin: function(username, email) {
      return this.getPage("POST", "/forgot-pass", {
        username: username,
        email: email
      });
    },
    login: function(username, password) {
      return this.getPage("POST", "/login", {
        username: username,
        password: password
      });
    },
    logout: function() {
      return this.getPage("GET", "/logout", {});
    }
  };
}]);