/*global angular*/

angular.module('koc.controllers')

  .controller('IntelCtrl', ['$scope', '$stateParams', '$state', '$ionicLoading', '$rootScope', '$ionicPlatform', '$ionicPopup', '$ionicScrollDelegate', '$timeout', '$log', 'User', 'KoC',
    function ($scope, $stateParams, $state, $ionicLoading, $rootScope, $ionicPlatform, $ionicPopup, $ionicScrollDelegate, $timeout, $log, User, KoC) {

      $log.debug("IntelCtrl");
      $scope.disableActions = false;
      $scope.intelError = "Loading...";
      $scope.b_start = 0;
      $scope.o_start = 0;

      $scope.showIntelFile = function(asset_id) {
        if (isFinite(asset_id) && asset_id > 0) $state.go('app.intelfile', {
          asset_id: asset_id
        });
      };

      $scope.showUserStats = function (userid) {
        if (isFinite(userid) && userid > 0)
          $state.go('app.stats', { userid: userid } );
      };

      $scope.reloadIntel = function(b_start, o_start, cacheTimeInSeconds) {
        $log.debug("loading the intel log, cacheTimeInSeconds=" + cacheTimeInSeconds + ", b_start: " + b_start + ", o_start: " + o_start);
        $scope.disableActions = true;

        KoC.getIntel(b_start, o_start, cacheTimeInSeconds)
          .success(function (response) {
            if (response.success === true) {
              $scope.intelError = "";
              $scope.intel = response.result;
              $log.debug("retrieved the intel log");
              $scope.b_start = b_start;
              $scope.o_start = o_start;
              $scope.cacheTimeInSeconds = cacheTimeInSeconds;
            }
            else {
              $scope.intelError = response.error;
            }
          }).error(function (error) {
            $scope.intelError = "An error occurred retrieving the intel log";
          }).
          finally(function () {
            $log.debug("finished processing intel log");
            $scope.disableActions = false;
            $scope.$broadcast('scroll.refreshComplete');
          });
      };

      $timeout(function(){
        // If valid intel retrieved less than a minute ago, re-use it, else, reload
        $scope.cacheTimeInSeconds = 60;
        $scope.reloadIntel($scope.b_start, $scope.o_start, $scope.cacheTimeInSeconds);
      }, 500 );


    }]);