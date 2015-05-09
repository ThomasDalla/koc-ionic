/*global angular, ionic*/

angular.module('koc.controllers')

  .controller('AboutCtrl', ['$scope', '$ionicPlatform', '$log', '$cordovaClipboard', '$ionicLoading', 'Config',
    function ($scope, $ionicPlatform, $log, $cordovaClipboard, $ionicLoading, Config) {

      $log.debug("AboutCtrl");
      $scope.appVersion = 'local dev';
      $scope.apiVersion = null;

      $ionicPlatform.ready(function () {
        $log.debug('Platform ready');
        if(!!window.cordova) { // on device
          cordova.getAppVersion(function (version) {
            $scope.appVersion = version;
          });
        }
      });

      $scope.endpoints = [];
      $scope.refreshEndpoints = function() {
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
      $scope.refreshEndpoints();

      $scope.openGitHub = function(){
        window.open('http://github.com/ThomasDalla/koc-ionic', '_system', 'location=yes');
        return false;
      };

      $scope.copyToClipboard = function(type, text){
        $cordovaClipboard
          .copy(text)
          .then(function () {
            $ionicLoading.show({template: type + " address copied", noBackdrop: true, duration: 500});
          }, function () {
            $ionicLoading.show({template: "Error copying " + type + " address...", noBackdrop: true, duration: 2000});
          });
      };

    }]);