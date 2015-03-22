/*global angular*/

angular.module('koc.controllers')

  .controller('BattleReportCtrl', ['$scope', '$stateParams', '$state', '$ionicLoading', '$rootScope', '$ionicPopup', '$log', 'User', 'KoC',
    function ($scope, $stateParams, $state, $ionicLoading, $rootScope, $ionicPopup, $log, User, KoC) {

      $log.debug("BattleReportCtrl");
      $scope.battleReportError = "Loading...";

      var attack_id = $stateParams.attack_id;

      $scope.reloadBattleReport = function (cacheTimeInSeconds) {
        $log.debug("load the battle report, cacheTimeInSeconds=" + cacheTimeInSeconds);
        $scope.battleReportError = "";
        KoC.getBattleReport(attack_id, cacheTimeInSeconds).success(function (response) {
          if (response.success === true) {
            $scope.battleReport = response.result;
            $rootScope.$broadcast('kocAdvisor', response.help);
            $log.debug("retrieved the battle report");
          }
          else {
            $scope.battleReportError = response.error;
          }
        }).error(function (error) {
          $scope.battleReportError = "An error occurred retrieving the battle report";
        }).
          finally(function () {
            $log.debug("finally");
            // Stop the ion-refresher from spinning
            $scope.$broadcast('scroll.refreshComplete');
          });
      };

      // If valid battle report retrieved less than 10 days ago, re-use it
      var cacheTimeInSeconds = 60 * 60 * 24 * 10;
      $scope.battleReport = User.getCache("/battlereport/" + attack_id, -1); // by default when opening, get it from the cache
      $scope.reloadBattleReport(cacheTimeInSeconds); // but also reload if older than 10 days

    }]);