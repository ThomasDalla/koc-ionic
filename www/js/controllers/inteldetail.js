/*global angular*/

angular.module('koc.controllers')

  .controller('IntelDetailCtrl', ['$scope', '$stateParams', '$state', '$ionicLoading', '$rootScope', '$ionicPopup', '$log', 'User', 'KoC',
    function ($scope, $stateParams, $state, $ionicLoading, $rootScope, $ionicPopup, $log, User, KoC) {

      $log.debug("IntelDetailCtrl");
      $scope.intelDetailError = "Loading...";
      $scope.disableActions = false;

      var report_id = $stateParams.report_id;
      $scope.userid = $stateParams.userid;

      $scope.reloadIntelDetail = function (cacheTimeInSeconds) {
        $log.debug("load the intel detail, cacheTimeInSeconds=" + cacheTimeInSeconds);
        $scope.intelDetailError = "";
        KoC.getIntelDetail(report_id, cacheTimeInSeconds).success(function (response) {
          if (response.success === true) {
            $scope.intelDetail = response.result;
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


      $scope.reconButtonText = "Spy again";
      $scope.recon = function(){
        if(!$scope.disableActions){
          $scope.reconButtonText = "Spying...";
          $scope.disableActions = true;
          $log.debug('Spying from inteldefail.js...');
          KoC.recon($scope.userid).success(function (response) {
            if (response.success
              && response.result !== undefined
              && response.result.reportId !== undefined
              && isFinite(response.result.reportId)
              && response.result.reportId > 0 ) {
              $scope.intelDetail = response.result;
              $log.debug("retrieved the intel detail");
            } else {
              $log.debug(response);
              $ionicLoading.show({template: "Error: " + response.error, noBackdrop: true, duration: 2000});
            }
          }).error(function () {
            $ionicLoading.show({template: 'An error occurred spying the enemy', noBackdrop: true, duration: 2000});
          }).finally(function(){
            $scope.disableActions = false;
            $scope.reconButtonText = "Spy again";
          });
        }
      };

      $scope.attackButtonText = "Attack";
      $scope.attack = function() {
        if(!$scope.disableActions){
          $scope.attackButtonText = "Attacking...";
          $scope.disableActions = true;
          $log.debug('Attacking from stats.js...');
          KoC.attack($scope.userid).success(function (response) {
            if (response.success
              && response.result !== undefined
              && response.result.attackId !== undefined
              && isFinite(response.result.attackId)
              && response.result.attackId > 0 ) {
              $log.debug('moving from inteldetail to battlereport...');
              $state.go('app.battlereport', {
                attack_id: response.result.attackId,
                userid: $scope.userid,
              });
            } else {
              $log.debug(response);
              $ionicLoading.show({template: "Error: " + response.error, noBackdrop: true, duration: 2000});
            }
          }).error(function () {
            $ionicLoading.show({template: 'An error occurred attacking the enemy', noBackdrop: true, duration: 2000});
            $scope.disableActions = false;
            $scope.attackButtonText = "Attack";
          });
        }
      };

      $scope.raidButtonText = "Raid";
      $scope.raid = function() {
        if(!$scope.disableActions){
          $scope.raidButtonText = "Attacking...";
          $scope.disableActions = true;
          $log.debug('Raiding from stats.js...');
          KoC.raid($scope.userid).success(function (response) {
            if (response.success
              && response.result !== undefined
              && response.result.attackId !== undefined
              && isFinite(response.result.attackId)
              && response.result.attackId > 0 ) {
              $log.debug('moving from inteldetail to battlereport...');
              $state.go('app.battlereport', {
                attack_id: response.result.attackId,
                userid: $scope.userid,
              });
            } else {
              $log.debug(response);
              $ionicLoading.show({template: "Error: " + response.error, noBackdrop: true, duration: 2000});
            }
          }).error(function () {
            $ionicLoading.show({template: 'An error occurred attacking the enemy', noBackdrop: true, duration: 2000});
            $scope.disableActions = false;
            $scope.raidButtonText = "Raid";
          });
        }
      };

      // If valid intel detail retrieved less than 10 days ago, re-use it
      var cacheTimeInSeconds = 60 * 60 * 24 * 10;
      $scope.intelFile = User.getCache("/inteldetail/" + report_id, -1); // by default when opening, get it from the cache
      $scope.reloadIntelDetail(cacheTimeInSeconds); // but also reload if older than 10 days

    }]);