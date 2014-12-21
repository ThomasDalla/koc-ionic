/*global angular, ionic*/

angular.module('koc.controllers')

.controller('SettingsCtrl', ['$scope', '$stateParams', '$state', '$ionicLoading', '$rootScope', '$log', 'User',
  function($scope, $stateParams, $state, $ionicLoading, $rootScope, $log, User) {

  $scope.cacheSize = User.getCacheSize();

  $log.debug("SettingsCtrl");
  $scope.platform    = ionic.Platform.platform();
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