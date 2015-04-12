/*global angular, ionic*/

angular.module('koc.controllers')

  .controller('AboutCtrl', ['$scope', '$ionicPlatform', '$log', '$cordovaClipboard', '$ionicLoading', 'KoC',
    function ($scope, $ionicPlatform, $log, $cordovaClipboard, $ionicLoading, KoC) {

      $log.debug("AboutCtrl");
      $scope.appVersion = '0.0.0';
      $scope.apiVersion = null;

      $ionicPlatform.ready(function () {
        $log.debug('Platform ready');
        if(typeof cordova !== 'undefined') { // on device
          cordova.getAppVersion(function (version) {
            $scope.appVersion = version;
          });
        }
      });

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

      KoC.getApiVersion()
        .success(function(res){
          $scope.apiVersion = res;
        })
        .error(function(res){
          $scope.apiVersion = null;
        });

    }]);