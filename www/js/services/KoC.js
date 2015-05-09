/*global angular*/

angular.module('koc.services')
  .config(['$httpProvider', function ($httpProvider) {

    //$httpProvider.defaults.withCredentials = true;
    $httpProvider.defaults.cache = false;

    // HTTP interceptor
    $httpProvider.interceptors.push(['$q', '$injector', '$rootScope', '$log', 'User',
      function ($q, $injector, $rootScope, $log, User) {
        return {
          'responseError': function (rejection) {
            $rootScope.$broadcast('showLoading', false);
            $log.warn('rejection:', rejection);
            return {
              success: false,
              error: "Request rejected",
            }
          },
          'response': function (response) {
            // Middleware that catches responses from the API
            if (response !== undefined && typeof(response.data) == "object") {
              // Set the session (if present)
              User.setSession(response.data.session);
              if (
                // Special case of the battlefield where success can be true while logged off
                typeof(response.data.result) == "object"
                && response.data.result.loggedIn !== undefined
                && response.data.result.loggedIn === false
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
                var location;
                if(response.config.page!==undefined)
                  location = response.config.page;
                else {
                  var re = /:\/\/[^\/]+\/[api/]*(.*)/;
                  var m  = re.exec(response.config.url);
                  location = m !== null ? '/' + m[1] : response.config.url;
                }
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
                if(response.data.location!==undefined
                  &&response.data.location.indexOf("/inteldetail.php")==0
                  &&response.data.result.reportId>0){
                  location = "/inteldetail/" + response.data.result.reportId;
                }
                else if(response.data.location!==undefined
                  &&response.data.location.indexOf("/detail.php")==0
                  &&response.data.result.attackId>0){
                  location = "/detail/" + response.data.result.attackId;
                }
                $log.debug("setting page retrieved: " + location);

                User.setPageRetrieved(location, response.data);
                $rootScope.$broadcast('showLoading', false);
                return response;
              }
              else if(response.data.success!==undefined&&response.data.location!='/bansuspend.php') {
                $log.error("We seem to have failed loading the page correctly.");
                $log.debug(response);
              }
            }
            // propagate the response
            $rootScope.$broadcast('showLoading', false);
            return response;
          }
        };
      }]);
  }])

  .factory('KoC', [
      '$http', '$log', '$q', '$rootScope', 'User', 'Config',
      function ($http, $log, $q, $rootScope, User, Config) {
    return {
      kocApi : function() {
        var endpoints = Config.getEndpoints();
        var randomIndex = Math.floor(Math.random() * endpoints.length);
        return endpoints[randomIndex];
      },
      apiPage: function(page) {
        return this.kocApi() + page;
      },
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
      getPage: function (method, page, data, cacheTimeInSeconds, loginAndRetry, host) {

        var kocService = this;
        var url = kocService.apiPage(page);
        if (host!==undefined && host.length > 0){
          url = host + page;
        }

        // cacheTime:
        //   -1 : return the cache if it exists, no matter how old it is
        //    0 : never return the cache
        //  positive number: return the cache if not older than the given number (in seconds)

        // Booleanize loginAndRetry
        loginAndRetry = !!loginAndRetry;

        // Get from cache if requested and available
        if (cacheTimeInSeconds !== undefined && cacheTimeInSeconds !== null && cacheTimeInSeconds !== 0) {
          $log.debug("checking " + page + " from the cache...");
          var cache = User.getCache(page, cacheTimeInSeconds);
          if( cache !== null && cache !== undefined ) {
            $log.debug("Cache available, loading it");
            // must be a promise
            var defer = $q.defer();
            var p = defer.promise;
            defer.resolve(cache);
            return p;
          }
        }
        var session = User.getSession();
        $rootScope.$broadcast('showLoading', true);
        return $http({
          method: method,
          url: url,
          data: data,
          headers: {
            'X-KoC-Session': session,
          },
          loginAndRetry: loginAndRetry,
          page: page,
          cache: false,
          timeout: 10*1000, // in ms
        });
      },
      forgotLogin: function (username, email) {
        return this.getPage("POST", "/forgot-pass", {
          username: username,
          email: email
        });
      },
      login: function (username, password) {
        var isCordova = !!window.cordova;
        if(!isCordova) {
          // We must have a local instance of koc-api running so that we login locally
          return this.getPage("POST", "/login", {
            username: username,
            password: password,
          }, 0, false, "http://localhost:3000/api");
        }
        else if( ionic.Platform.platform() == "android"
              || ionic.Platform.platform() == "ios" ) {
          var platform = ionic.Platform.platform();
          $log.debug("trying to login natively on "+platform+"...");
          var defer2 = $q.defer();
          var p2 = defer2.promise;
          // Login natively
          $rootScope.$broadcast('showLoading', true);
          window.cordova.plugins.koc.login(username, password, function(response){
            $rootScope.$broadcast('showLoading', false);
            $log.debug("logged in natively", response);
            defer2.resolve(response);
          }, function(error) {
            $rootScope.$broadcast('showLoading', false);
            $log.debug("error logging in natively", error);
            defer2.resolve({
              success: false,
              error: "Error trying to login natively",
              details: error,
            });
          });
          return p2;
        }
        else {
          var defer = $q.defer();
          var p = defer.promise;
          defer.resolve({
            success: false,
            error: 'Login disabled until I write a native login',
          });
          return p;
        }
      },
      logout: function () {
        return this.getPage("GET", "/logout", {});
      },
      verifyEmail: function (email) {
        return this.getPage("POST", "/verify-email", {email: email});
      },
      getAttackLog: function(b_start, o_start, cacheTimeInSeconds) {
        return this.getPage("POST", "/attacklog", {
          b_start: b_start,
          o_start: o_start,
        }, cacheTimeInSeconds, true);
      },
      getIntel: function(b_start, o_start, cacheTimeInSeconds) {
        return this.getPage("POST", "/intel", {
          b_start: b_start,
          o_start: o_start,
        }, cacheTimeInSeconds, true);
      },
      getBattleReport: function(attack_id, cacheTimeInSeconds) {
        return this.getPage("GET", "/battlereport/" + attack_id, {}, cacheTimeInSeconds, true);
      },
      getIntelFile: function(asset_id, cacheTimeInSeconds) {
        return this.getPage("GET", "/intelfile/" + asset_id, {}, cacheTimeInSeconds, true);
      },
      getIntelDetail: function(report_id, cacheTimeInSeconds) {
        return this.getPage("GET", "/inteldetail/" + report_id, {}, cacheTimeInSeconds, true);
      },
      getApiVersion: function() {
        return this.getPage("GET", "/version", {}, 0, false);
      },
      recon: function(user_id, turing) {
        if(turing===undefined||turing===null||!turing.length){
          return this.getPage("GET", "/recon/" + user_id, {}, 0, true);
        }
        else{
          return this.getPage("POST", "/recon/" + user_id, {
            turing: turing,
          }, 0, true);
        }
      },
      attack: function(user_id, turing) {
        if(turing===undefined||turing===null||!turing.length){
          return this.getPage("GET", "/attack/" + user_id, {}, 0, true);
        }
        else{
          return this.getPage("POST", "/attack/" + user_id, {
            turing: turing,
          }, 0, true);
        }
      },
      raid: function(user_id, turing) {
        if(turing===undefined||turing===null||!turing.length){
          return this.getPage("GET", "/raid/" + user_id, {}, 0, true);
        }
        else{
          return this.getPage("POST", "/raid/" + user_id, {
            turing: turing,
          }, 0, true);
        }
      },
    };
  }]);