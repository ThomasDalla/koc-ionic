/*global angular,Ionic*/

angular.module('koc.services')

.factory('IonicUpdate', ['$log', '$q', '$ionicLoading', 'User', function ($log, $q, $ionicLoading, User) {
		return {
			getIonicDeploy: function(){
				var self = this;
				var isCordovaApp = !!window.cordova;
				if(isCordovaApp){
					if(!self.deploy) {
						try {
							if (Ionic === undefined) {
								$log.error("Ionic not defined!");
								return null;
							}
							self.deploy = new Ionic.Deploy();
							self.deploy.setChannel(User.getChannel());
						}
						catch (e){
							$log.error("Error initializing Ionic Deploy");
							return null;
						}
					}
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
					if(deploy==null){
						$log.error("Ionic not initialized...");
						defer.resolve(false);
					}
					deploy.check().then(function (hasUpdate) {
						$log.debug('Update available: ' + hasUpdate);
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
				var defer = $q.defer();
				var p = defer.promise;
				var isCordovaApp = !!window.cordova;
				if(!isCordovaApp){
					var s = "Not updating app because not on a device";
					$log.debug(s);
					defer.reject(s);
					return p;
				}
				var deploy = this.getIonicDeploy();
				if(deploy==null){
					var s2 = "Ionic not initialized...";
					$log.error(s2);
					defer.reject(s2);
					return p;
				}
				return deploy.update();
			},
			updateIfNewerVersion: function(){
				var self = this;
				self.checkForUpdate().then(function(hasUpdate){
					if(hasUpdate){
						$ionicLoading.show({
							template: "New app version found, updating...",
							noBackdrop: true,
							duration: 3000
						});
						self.doUpdate().then(function(res) {
							$log.debug('Auto-update success! ', res);
							$ionicLoading.show({
								template: "Application successfully updated",
								noBackdrop: true,
								duration: 1000
							});
						}, function(err) {
							$log.debug('Auto-update error!', err);
							$ionicLoading.show({
								template: "Error updating the application...",
								noBackdrop: true,
								duration: 1000
							});
						}, function(prog) {
							if(prog==50){
								$ionicLoading.show({
									template: "Download completed, installing new app...",
									noBackdrop: true,
									duration: 2000
								});
							}
						});
					}
				});
			}
		}
}]);
