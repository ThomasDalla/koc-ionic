/*global angular*/

angular.module('koc.services')

  .factory('Config', ['$log', '$q', '$http', 'DefaultConfig', 'ConfigUrl', function ($log, $q, $http, DefaultConfig, ConfigUrl) {
    return {
      /**
       * Get the config
       * @returns {Object}
       */
      getConfig: function() {
        // Try to load it from the session cache
        var remoteConfig = sessionStorage.getItem('remoteConfig');
        if(remoteConfig!=null) {
          // we seem to have already loaded it, let's check what we have
          try {
            return JSON.parse(remoteConfig);
          } catch(e) {
            $log.warn('An error occurred parsing the remote Config from the sessionStorage', remoteConfig, e);
          }
        }
        // load the config from remote
        if(sessionStorage.getItem('remoteConfigHttp')==null) {
          sessionStorage.setItem('remoteConfigHttp','loading');
          var firebaseRef = new Firebase(ConfigUrl);
          firebaseRef.on("value", function(snapshot) {
            if(snapshot!==undefined&&typeof(snapshot)=="object") {
              var config = snapshot.val();
              $log.debug('Remote config loaded', config);
              if (config !== undefined && typeof(config) == "object"
                && config.hasOwnProperty('endpoints')
                && config['endpoints'].length) {
                var configStr = JSON.stringify(config);
                sessionStorage.setItem('remoteConfig', configStr);
              }
            }
            else {
              $log.debug('Error loading remote config', snapshot);
            }
            sessionStorage.setItem('remoteConfigHttp','loaded');
          }, function (err) {
            $log.warn('An error occured loading the remote config', err);
            sessionStorage.setItem('remoteConfigHttp','loaded');
          });
        }

        // but meanwhile, return from the DefaultConfig for now
        return DefaultConfig;
      },
      /**
       * Get the endpoints
       * @returns {Array}
       */
      getEndpoints: function(){
        return this.getConfig()['endpoints'];
      },
      getEndpointsVersions: function() {
        var endpoints = this.getEndpoints();
        var promises = [];
        endpoints.forEach(function(endpointUrl) {
          promises.push($http.get(endpointUrl + '/version'));
        });
        return $q.all(promises)
          .then(function(results){
            var endpointVersions = [];
            // add the url into the return object
            for(var i=0; i<results.length; i++) {
              var result = results[i].data;
              result.url = endpoints[i];
              endpointVersions.push(result);
            }
            return endpointVersions;
          }, function(err) {
            $log.error('an error occurred retrieving the endpoint versions', err);
          });
      },
    }
  }]);