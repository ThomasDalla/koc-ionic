/*global angular, ionic*/

angular.module('starter.controllers')

.controller('SettingsCtrl', ['$scope', '$stateParams', '$state', '$ionicLoading', '$rootScope', 'User', 'KoC',
  function($scope, $stateParams, $state, $ionicLoading, $rootScope, User, KoC) {

  console.log("SettingsCtrl");
  $scope.test        = ionic.Platform.platform();
  $scope.showAdvisor = User.showAdvisor();
  $rootScope.$broadcast('kocAdvisor', "");

  $scope.onShowAdvisorChange = function() {
    $scope.showAdvisor = !$scope.showAdvisor;
    console.log("onShowAdvisorChange", $scope.showAdvisor);
    User.setShowAdvisor($scope.showAdvisor);
  };

  $scope.clearCache = function() {
    User.clearCache();
    $ionicLoading.show({ template: 'Cache Cleared', noBackdrop: true, duration: 1000 });
  };

}]);