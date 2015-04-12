/*global angular*/

angular.module('koc.controllers')

  .controller('MainCtrl', ['$scope', '$ionicModal', '$timeout', '$state', '$ionicPopup', '$log', 'User',
    function ($scope, $ionicModal, $timeout, $state, $ionicPopup, $log, User) {

      $log.debug("MainCtrl");

      var cache = User.getCache("stats", -1);
      if( cache !== null && cache !== undefined)
        $scope.stats = cache;

      $scope.showAdvisor = User.showAdvisor();

      $scope.username = User.get().username;

      $scope.$on('kocStats', function (event, stats) {
        $log.debug("MainCtrl received kocStats");
        stats.username = User.get().username;
        $scope.stats = stats;
      });
      $scope.$on('kocAdvisor', function (event, help) {
        $log.debug("MainCtrl received kocAdvisor");
        if (help === undefined || help === null)
          help = "";
        $scope.advisor = help;
      });
      $scope.$on('kocShowAdvisor', function (event, showAdvisor) {
        $log.debug("MainCtrl received kocShowAdvisor:", showAdvisor);
        $scope.showAdvisor = showAdvisor;
      });

      $scope.showAdvisorHelp = function () {
        if ($scope.advisor.length) {
          $ionicPopup.alert({
            title: 'Help',
            template: $scope.advisor,
            okType: "button-dark",
          });
        }
      };

      $scope.loading = false;
      $scope.$on('showLoading', function(event, show) {
        $scope.loading = show;
      });

    }]);