/*global angular, ionic*/

angular.module('starter.controllers')

.controller('SettingsCtrl', ['$scope', '$stateParams', '$state', '$ionicLoading', '$rootScope', 'User', 'KoC',
  function($scope, $stateParams, $state, $ionicLoading, $rootScope, User, KoC) {

  $scope.cacheSize = User.getCacheSize();

  console.log("SettingsCtrl");
  $scope.test        = ionic.Platform.platform();
  $scope.showAdvisor = User.showAdvisor();
  $scope.speechRecognition = User.useSpeechRecognition();
  $rootScope.$broadcast('kocAdvisor', "");
  $scope.speechRecognitionSupported = ionic.Platform.platform() == "android";

  $scope.onShowAdvisorChange = function() {
    $scope.showAdvisor = !$scope.showAdvisor;
    User.setShowAdvisor($scope.showAdvisor);
  };

  $scope.onSpeechRecognitionChange = function() {
    $scope.speechRecognition = !$scope.speechRecognition;
    User.setSpeechRecognition($scope.speechRecognition);
  };

  $scope.clearCache = function() {
    User.clearCache();
    $scope.cacheSize = User.getCacheSize();
    $ionicLoading.show({ template: 'Cache Cleared', noBackdrop: true, duration: 1000 });
  };

}]);