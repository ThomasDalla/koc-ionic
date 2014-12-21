/*global angular*/

const KOC_API = "https://koc-api.herokuapp.com/api";
var apiPage = function (page) {
  return KOC_API + page;
};

angular.module('koc.services')
  .config(['$httpProvider', function ($httpProvider) {

    // HTTP interceptor
    $httpProvider.interceptors.push(['$q', '$injector', '$rootScope', '$log', 'User',
      function ($q, $injector, $rootScope, $log, User) {
        return {
          'response': function (response) {
            // Middleware that catches responses from the API
            if (response !== undefined && typeof(response.data) == "object") {
              // Set the session (if present)
              User.setSession(response.data.session);
              if ( // Special case of the battlefield where success can be true while logged off
              response.data.loggedIn !== undefined && response.data.loggedIn === false
              || (
              response.data.success === false &&
              response.config.loginAndRetry === true && User.hasLoggedIn()
              && response.data.location !== undefined && response.data.location.indexOf("error.php") >= 0
              && response.data.error.indexOf("Please login to view that page") >= 0
              )
              ) {
                // try to reconnect, and reload the request
                $log.debug("try to re-login and then retry the request before propagating");
                var user = User.get();
                var originalRequestConfig = response.config;
                var KoC = $injector.get('KoC');
                var $http = $injector.get('$http');
                var defer = $q.defer();
                var p = defer.promise;
                KoC.login(user.username, user.password).success(function (r) {
                  $log.debug("we re-logged in", r);
                  if (r.success) {
                    $log.debug("successfully, retrying initial request", originalRequestConfig);
                    return defer.resolve($http(originalRequestConfig));
                  }
                  $log.debug("failed to login");
                  defer.resolve(r);
                });
                return p;
              }
              else if (response.data.success === true) {
                $log.debug("success!");
                // Record that we retrieved that page
                var split = response.config.url.split(KOC_API);
                var location = split[split.length - 1];
                if (response.data.stats !== undefined
                  && response.data.stats.username !== undefined
                  && response.data.stats.goldText != "???"
                ) {
                  $log.debug("broadcasting kocStats");
                  $rootScope.$broadcast('kocStats', response.data.stats);
                  User.setPageRetrieved("stats", response.data.stats);
                }
                if (response.data.help !== undefined) {
                  $log.debug("broadcasting kocAdvisor");
                  $rootScope.$broadcast('kocAdvisor', response.data.help);
                }
                if (response.data.commanderChange !== undefined && response.data.commanderChange.success) {
                  $rootScope.$broadcast('kocChangeCommanderInfo', response.data.commanderChange);
                }
                $log.debug("setting page retrieved: " + location);
                User.setPageRetrieved(location, response.data);
                return response;
              }
              else {
                $log.debug("I don't know how to handle that request, that sucks!");
              }
            }
            // propagate the response
            return response;
          }
        };
      }]);
  }])

  .factory('KoC', ['$http', '$log', 'User', function ($http, $log, User) {
    return {
      getRaces: function (cacheTimeInSeconds) {
        return this.getPage("GET", "/races", {}, cacheTimeInSeconds);
      },
      getUserStats: function (userid, cacheTimeInSeconds) {
        return this.getPage("GET", "/stats/" + userid, {}, cacheTimeInSeconds, true);
      },
      changeRace: function (new_race) {
        return this.getPage("POST", "/changeRace", {new_race: new_race}, 0, true);
      },
      getBase: function (cacheTimeInSeconds) {
        return this.getPage("GET", "/base", {}, cacheTimeInSeconds, true);
      },
      getArmory: function (cacheTimeInSeconds) {
        return this.getPage("GET", "/armory", {}, cacheTimeInSeconds, true);
      },
      buyWeapons: function (turing, inputNameValue) {
        return this.getPage("POST", "/armory", {turing: turing, inputNameValue: inputNameValue}, 0, true);
      },
      getTraining: function (cacheTimeInSeconds) {
        return this.getPage("GET", "/train", {}, cacheTimeInSeconds, true);
      },
      trainTroops: function (turing, inputNameValue) {
        return this.getPage("POST", "/train", {turing: turing, inputNameValue: inputNameValue}, 0, true);
      },
      getMercenaries: function (cacheTimeInSeconds) {
        return this.getPage("GET", "/mercenaries", {}, cacheTimeInSeconds, true);
      },
      hireMercenaries: function (turing, inputNameValue) {
        return this.getPage("POST", "/mercenaries", {turing: turing, inputNameValue: inputNameValue}, 0, true);
      },
      getRecruit: function () {
        return this.getPage("GET", "/clicker", {}, 0, true);
      },
      postRecruit: function (data) {
        return this.getPage("POST", "/clicker", {data: data}, 0, true);
      },
      getHelp: function (cacheTimeInSeconds) {
        return this.getPage("GET", "/help", {}, cacheTimeInSeconds);
      },
      getChangeCommanderInfo: function () {
        return this.getPage("GET", "/changeCommanderInfo", {}, 0, true);
      },
      changeCommander: function (userid) {
        return this.getPage("POST", "/changeCommander", {
          new_commander_id: userid,
          password: User.get().password
        }, 0, true);
      },
      ditchCommander: function () {
        return this.getPage("POST", "/ditchCommander", {
          password: User.get().password
        }, 0, true);
      },
      getPage: function (method, page, data, cacheTimeInSeconds, loginAndRetry) {

        // cacheTime:
        //   -1 : return the cache if it exists, no matter how old it is
        //    0 : never return the cache
        //  positive number: return the cache if not older than the given number (in seconds)

        // Booleanize loginAndRetry
        loginAndRetry = !!loginAndRetry;

        // Get from cache if requested and available
        if (cacheTimeInSeconds !== undefined && cacheTimeInSeconds !== null && cacheTimeInSeconds !== 0) {
          $log.debug("checking " + page + " from the cache...");
          if (User.isCacheAvailable(page, cacheTimeInSeconds)) {
            $log.debug("Cache available, loading it");
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
      forgotLogin: function (username, email) {
        return this.getPage("POST", "/forgot-pass", {
          username: username,
          email: email
        });
      },
      login: function (username, password) {
        return this.getPage("POST", "/login", {
          username: username,
          password: password
        });
      },
      logout: function () {
        return this.getPage("GET", "/logout", {});
      },
      verifyEmail: function (email) {
        return this.getPage("POST", "/verify-email", {email: email});
      }
    };
  }]);