/*global angular*/

angular.module('koc.controllers')

  .controller('IntelFileCtrl', ['$scope', '$stateParams', '$state', '$ionicLoading', '$rootScope', '$ionicPopup', '$log', 'User', 'KoC',
    function ($scope, $stateParams, $state, $ionicLoading, $rootScope, $ionicPopup, $log, User, KoC) {

      $log.debug("IntelFileCtrl");
      $scope.intelFileError = "Loading...";

      var asset_id = $stateParams.asset_id;

      $scope.showIntelDetail = function(report_id) {
        if (isFinite(report_id) && report_id > 0) $state.go('app.inteldetail', {
          report_id: report_id,
          userid: asset_id,
        });
      };

      $scope.reloadIntelFile = function (cacheTimeInSeconds) {
        $log.debug("load the intel file, cacheTimeInSeconds=" + cacheTimeInSeconds);
        $scope.intelFileError = "";
        KoC.getIntelFile(asset_id, cacheTimeInSeconds).success(function (response) {
          if (response.success === true) {
            $scope.intelFile = response.result;
            $rootScope.$broadcast('kocAdvisor', response.help);
            $log.debug("retrieved the intel file");
          }
          else {
            $scope.intelFileError = response.error;
          }
        }).error(function (error) {
          $scope.intelFileError = "An error occurred retrieving the intel file";
        }).
          finally(function () {
            $log.debug("finally");
            // Stop the ion-refresher from spinning
            $scope.$broadcast('scroll.refreshComplete');
          });
      };

      // If valid intel file retrieved less than 5 minutes ago
      var cacheTimeInSeconds = 60 * 5;
      $scope.intelFile = User.getCache("/intelfile/" + asset_id, -1); // by default when opening, get it from the cache
      $scope.reloadIntelFile(cacheTimeInSeconds); // but also reload if older than 10 days

    }]);