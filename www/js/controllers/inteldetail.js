/*global angular*/

angular.module('koc.controllers')

  .controller('IntelDetailCtrl', ['$scope', '$stateParams', '$state', '$ionicLoading', '$rootScope', '$ionicPopup', '$log', 'User', 'KoC',
    function ($scope, $stateParams, $state, $ionicLoading, $rootScope, $ionicPopup, $log, User, KoC) {

      $log.debug("IntelDetailCtrl");
      $scope.intelDetailError = "Loading...";

      var report_id = $stateParams.report_id;

      $scope.reloadIntelDetail = function (cacheTimeInSeconds) {
        $log.debug("load the intel detail, cacheTimeInSeconds=" + cacheTimeInSeconds);
        $scope.intelDetailError = "";
        KoC.getIntelDetail(report_id, cacheTimeInSeconds).success(function (response) {
          if (response.success === true) {
            $scope.intelDetail = response.result;
            $rootScope.$broadcast('kocAdvisor', response.help);
            $log.debug("retrieved the intel detail");
          }
          else {
            $scope.intelDetailError = response.error;
          }
        }).error(function (error) {
          $scope.intelDetailError = "An error occurred retrieving the intel detail";
        }).
          finally(function () {
            $log.debug("finally");
            // Stop the ion-refresher from spinning
            $scope.$broadcast('scroll.refreshComplete');
          });
      };

      // If valid intel detail retrieved less than 10 days ago, re-use it
      var cacheTimeInSeconds = 60 * 60 * 24 * 10;
      $scope.intelFile = User.getCache("/inteldetail/" + report_id, -1); // by default when opening, get it from the cache
      $scope.reloadIntelDetail(cacheTimeInSeconds); // but also reload if older than 10 days

    }]);