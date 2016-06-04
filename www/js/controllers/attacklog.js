/*global angular*/

angular.module('koc.controllers')

  .controller('AttackLogCtrl', ['$scope', '$stateParams', '$state', '$ionicLoading', '$ionicHistory', '$rootScope', '$ionicPlatform', '$ionicPopup', '$ionicScrollDelegate', '$timeout', '$log', 'User', 'KoC',
    function ($scope, $stateParams, $state, $ionicLoading, $ionicHistory, $rootScope, $ionicPlatform, $ionicPopup, $ionicScrollDelegate, $timeout, $log, User, KoC) {

      $log.debug("AttackLogCtrl");
      $scope.disableActions = false;
      $scope.attackLogError = "Loading...";
      $scope.b_start = 0;
      $scope.o_start = 0;

      $ionicHistory.clearHistory();
      var vh = $ionicHistory.viewHistory();
      if(vh !== null) {
        $log.info("Views:", vh.views );
        $log.info("Back:" , vh.backView );
      }
      $ionicHistory.nextViewOptions({
        disableAnimate: true,
        disableBack: false,
      });

      $scope.showUserStats = function (userid) {
        if (isFinite(userid) && userid > 0)
          $state.go('app.stats', { userid: userid } );
      };

      $scope.showBattleReport = function (attack_id) {
        if (isFinite(attack_id) && attack_id > 0)
          $state.go('app.battlereport', { attack_id: attack_id } );
      };

      $scope.reloadAttackLog = function(b_start, o_start, cacheTimeInSeconds) {
        $log.debug("loading the attack log, cacheTimeInSeconds=" + cacheTimeInSeconds + ", b_start: " + b_start + ", o_start: " + o_start);
        $scope.disableActions = true;

        KoC.getAttackLog(b_start, o_start, cacheTimeInSeconds)
          .success(function (response) {
						if(response!=null) {
							if (response.success === true) {
								$log.debug("retrieved the attack log");
								$scope.attackLogError = "";
								$scope.attacklog = response.result;
								$scope.b_start = b_start;
								$scope.o_start = o_start;
								$scope.cacheTimeInSeconds = cacheTimeInSeconds;
							}
							else {
								$log.debug("Error loading the attack log: ", response);
								$scope.attackLogError = response.error;
							}
						}
						else {
							$scope.attackLogError = "No logs yet";
						}
          }).error(function (error) {
            $scope.attackLogError = "An error occurred retrieving the attack log";
          }).
          finally(function () {
            $log.debug("finished processing attack log");
            $scope.disableActions = false;
            $scope.$broadcast('scroll.refreshComplete');
          });
      };

      $scope.$on('$ionicView.enter', function(){
        // If valid attacklog retrieved less than a minute ago, re-use it, else, reload
        $scope.cacheTimeInSeconds = 60;
        $scope.reloadAttackLog($scope.b_start, $scope.o_start, $scope.cacheTimeInSeconds);
      });

    }]);
