/*global angular*/

angular.module('starter.controllers')

.controller('RecruitCtrl', ['$scope', '$stateParams', '$state', '$ionicLoading', '$rootScope', '$ionicPlatform', '$ionicPopup', '$ionicScrollDelegate', '$timeout', '$http', 'User', 'KoC',

function($scope, $stateParams, $state, $ionicLoading, $rootScope, $ionicPlatform, $ionicPopup, $ionicScrollDelegate, $timeout, $http, User, KoC) {

  console.log("RecruitCtrl");
  $scope.disableActions = false;
  $scope.recruitError = "";

  var updateRecruit = function(promise) {
    promise.success(function(response) {
      console.log("got the recruit page:", response);
      if (response.success === true) {
        $scope.recruit = response;
        console.log("retrieved the recruit");
        //$rootScope.$broadcast('kocAdvisor', response.help);
      }
      else {
        $scope.recruitError = response.error;
      }
    }).error(function(error) {
      $scope.recruitError = "An error occurred retrieving the recruit";
    }).
    finally(function() {
      $scope.disableActions = false;
      $scope.$broadcast('scroll.refreshComplete');
    });
  };

  $scope.reloadRecruit = function() {
    $scope.recruitError = "";
    $scope.disableActions = true;
    updateRecruit( KoC.getRecruit() );
  };

  $scope.sendLetter = function(letter) {
    var data = $scope.recruit.hiddenFields;
    data[$scope.recruit.fieldName] = letter;
    updateRecruit( KoC.postRecruit(data) );
  };

  $scope.reloadRecruit();

}]);