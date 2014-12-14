/*global angular*/

angular.module('starter.controllers')
.controller('BattlefieldCtrl', ['$scope', '$stateParams', '$state', '$ionicLoading', '$rootScope', '$ionicPlatform', '$ionicPopup', '$ionicScrollDelegate', '$timeout', 'User', 'KoC',
function($scope, $stateParams, $state, $ionicLoading, $rootScope, $ionicPlatform, $ionicPopup, $ionicScrollDelegate, $timeout, User, KoC) {

  console.log("BattlefieldCtrl");
  $scope.disableActions = false;
  $scope.battlefieldError = "";

  $scope.reloadBattlefield = function() {
    $scope.getBattlefield(0, $scope.battlefield.currentPage);
  };

  $scope.getBattlefield = function(cacheTimeInSeconds, page) {
    console.log("loading the battlefield, cacheTimeInSeconds=" + cacheTimeInSeconds + ",page: " + page );
    $scope.disableActions = true;
    var action = "/battlefield/" + page;
    var data = {};
    var method = "GET";
    if(page===undefined||!isFinite(page)) {
      action = "/attack";
      if(page<=0){
        $ionicLoading.show({ template: "No Page " + page, noBackdrop: true, duration: 1000 });
        return;
      }
    }
    else
      data = {
        page: page,
      };
    KoC.getPage(method, action, data, cacheTimeInSeconds, true)
      .success(function(response) {
      if (response.success === true) {
        $scope.battlefield = response;
        console.log("retrieved the battlefield");
      }
      else {
        $scope.battlefieldError = response.error;
      }
    }).error(function(error) {
      $scope.battlefieldError = "An error occurred retrieving the battlefield";
    }).
      finally(function() {
        console.log("finished processing battlefield");
        $scope.disableActions = false;
        $scope.$broadcast('scroll.refreshComplete');
      });
  };

  // If valid battlefield retrieved less than 60 seconds ago, re-use it, else, reload
  $scope.cacheTimeInSeconds = 60;
  $scope.getBattlefield($scope.cacheTimeInSeconds);

}]);