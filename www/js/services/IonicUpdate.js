/*global angular*/

angular.module('koc.services')

.factory('IonicUpdate', ['$log', '$q', '$ionicLoading', function ($log, $q, $ionicLoading) {
		return {
			getIonicDeploy: function(){
				var self = this;
				var isCordovaApp = !!window.cordova;
				if(isCordovaApp){
					if(!self.deploy)
						self.deploy = new Ionic.Deploy();
					return self.deploy;
				}
				return null;
			},
			checkForUpdate: function(){
				var isCordovaApp = !!window.cordova;
				var defer = $q.defer();
				var p = defer.promise;
				if(!isCordovaApp){
					defer.resolve(false);
					$log.debug("Skipping new app version check because not on a device");
				}
				else {
					var deploy = this.getIonicDeploy();
					deploy.check().then(function (hasUpdate) {
						$log.debug('Ionic Deploy: Update available: ' + hasUpdate);
						defer.resolve(hasUpdate);
					}, function (err) {
						var errMsg = 'Failed checking for app updates...';
						$ionicLoading.show({
							template: errMsg,
							noBackdrop: true,
							duration: 1000
						});
						$log.error(errMsg, err);
						defer.resolve(false);
					});
				}
				return p;
			},
			doUpdate: function(){
				var isCordovaApp = !!window.cordova;
				if(!isCordovaApp){
					$log.debug("Not updating app because not on a device");
					return;
				}
				var deploy = this.getIonicDeploy();
				deploy.update().then(function(res) {
					$log.debug('Ionic Deploy: Update Success! ', res);
					$ionicLoading.show({
						template: "Application successfully updated",
						noBackdrop: true,
						duration: 1000
					});
				}, function(err) {
					$log.debug('Ionic Deploy: Update error! ', err);
					$ionicLoading.show({
						template: "Error updating the application...",
						noBackdrop: true,
						duration: 1000
					});
				}, function(prog) {
					$log.debug('Ionic Deploy: Progress... ', prog);
				});
			},
			updateIfNewerVersion: function(){
				var self = this;
				self.checkForUpdate().then(function(hasUpdate){
					if(hasUpdate){
						self.doUpdate();
					}
				});
			}
		}
}]);