/*global angular, ionic*/

angular.module('koc.controllers')

  .controller('AboutCtrl', ['$scope', '$ionicPlatform', '$log', '$cordovaClipboard', '$ionicLoading', 'Config', 'IonicUpdate', 'User',
    function ($scope, $ionicPlatform, $log, $cordovaClipboard, $ionicLoading, Config, IonicUpdate, User) {

      $log.debug("AboutCtrl");
      $scope.appVersion = 'local dev';
      $scope.apiVersion = null;
			$scope.newVersionAvailable = false;
			$scope.checkingNewVersions = false;
			$scope.isUpdating = false;
			$scope.updateProgress = 0;
			$scope.channel = User.getChannel();

			var checkNewAppVersion = function(){
				$scope.newVersionAvailable = false;
				$scope.checkingNewVersions = true;
				IonicUpdate.checkForUpdate().then(function(hasUpdate){
					$scope.newVersionAvailable = hasUpdate;
					$scope.checkingNewVersions = false;
				});
			};

      $ionicPlatform.ready(function () {
        $log.debug('Platform ready');
        if(!!window.cordova) { // on device
          window.cordova.getAppVersion(function (version) {
            $scope.appVersion = version;
          });
					checkNewAppVersion();
        }
      });

			$scope.doUpdate = function(){
				$scope.isUpdating = true;
				$scope.updateProgress = 0;
				IonicUpdate.doUpdate().then(function(res) {
					$scope.isUpdating = false;
					$log.debug('Update success from About!', res);
					$ionicLoading.show({
						template: "Application successfully updated",
						noBackdrop: true,
						duration: 1000
					});
				}, function(err) {
					$scope.isUpdating = false;
					$log.debug('Update error from About! ', err);
					$ionicLoading.show({
						template: "Error updating the application...",
						noBackdrop: true,
						duration: 1000
					});
				}, function(prog) {
					if($scope.updateProgress<50&&prog>=50){
						$ionicLoading.show({
							template: "Download completed, installing new app...",
							noBackdrop: true,
							duration: 2000
						});
					}
					$scope.updateProgress = Math.trunc(prog);
					$log.debug('Update from About: ', $scope.updateProgress);
					$scope.$apply();
				});
			};

      $scope.endpoints = [];
      var refreshEndpoints = function() {
        Config.getEndpointsVersions()
          .then(function (res) {
            $scope.endpoints = res;
            $scope.$broadcast('scroll.refreshComplete');
          }, function (err) {
            $log.error('Error loading the endpoints versions', err);
            $scope.endpoints = [];
            $scope.$broadcast('scroll.refreshComplete');
          });
      };

			$scope.refreshPage = function(){
				if(!$scope.isUpdating) {
					refreshEndpoints();
					checkNewAppVersion();
				}
			};

      $scope.openGitHub = function(){
        window.open('http://thomasdalla.github.io/koc-ionic', '_system', 'location=yes');
        return false;
      };

      $scope.copyToClipboard = function(type, text){
				if(!!window.cordova)
				{ // on device
					$cordovaClipboard
						.copy(text)
						.then(function () {
							$ionicLoading.show({template: type + " address copied", noBackdrop: true, duration: 500});
						}, function () {
							$ionicLoading.show({template: "Error copying " + type + " address...", noBackdrop: true, duration: 2000});
						});
				}
				else
				{
					$ionicLoading.show({template: "Not supported on local dev", noBackdrop: true, duration: 500});
				}
      };

			$scope.$on('$ionicView.enter', function(){
				refreshEndpoints();
			});

    }]);
