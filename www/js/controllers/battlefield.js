/*global angular*/

angular.module('koc.controllers')
  .controller('BattlefieldCtrl', ['$scope', '$stateParams', '$state', '$ionicLoading', '$rootScope', '$ionicPlatform', '$ionicPopup', '$ionicScrollDelegate', '$timeout', '$log', 'User', 'KoC',
    function ($scope, $stateParams, $state, $ionicLoading, $rootScope, $ionicPlatform, $ionicPopup, $ionicScrollDelegate, $timeout, $log, User, KoC) {

      $log.debug("BattlefieldCtrl");
      $scope.disableActions = false;
      $scope.battlefieldError = "";

      var retrieveLastPage = function() {
        if ($stateParams.page === undefined || $stateParams.page == 0) {
          $stateParams.page = ($rootScope.lastBattlefieldPage !== undefined) ? $rootScope.lastBattlefieldPage : 0;
        }
      };
      retrieveLastPage();

      $scope.battlefield = {
        currentPage: $stateParams.page,
        maxPage: User.getBattlefieldMaxPage(),
      };

      $scope.reloadBattlefield = function () {
        $scope.getBattlefield(0, $scope.battlefield.currentPage);
      };

      $scope.showUserStats = function (userid) {
        if (isFinite(userid) && userid > 0)
          $state.go('app.stats', { userid: userid });
      };

      $scope.goToPage = function (page) {
        if (isFinite(page) && page > 0) {
          $rootScope.lastBattlefieldPage = page;
          $state.go('.', {page: page});
        }
      };

      $scope.promptGoToPage = function () {
        $ionicPopup.prompt({
          title: 'Jump To Page',
          template: 'Page:',
          inputType: 'number',
          inputPlaceholder: 'Page',
          okType: 'button-dark',
        }).then(function (page) {
          $scope.goToPage(page);
        });
      };

      $scope.getBattlefield = function (cacheTimeInSeconds, page) {
        $log.debug("loading the battlefield, cacheTimeInSeconds=" + cacheTimeInSeconds + ",page: " + page);
        $scope.disableActions = true;
        var action = "/battlefield/" + page;
        var data = {};
        var method = "GET";
        if (page === undefined || !isFinite(page) || page <= 0)
          action = "/attackfield";
        else
          data = {
            page: page,
          };
        KoC.getPage(method, action, data, cacheTimeInSeconds, true)
          .success(function (response) {
            if (response.success === true) {
              $scope.battlefield = response.result;
              User.setBattlefieldMaxPage($scope.battlefield.maxPage);
              $log.debug("retrieved the battlefield");
            }
            else {
              $scope.battlefieldError = response.error;
            }
          }).error(function (error) {
            $scope.battlefieldError = "An error occurred retrieving the battlefield";
          }).
          finally(function () {
            $log.debug("finished processing battlefield");
            $scope.disableActions = false;
            $scope.$broadcast('scroll.refreshComplete');
          });
      };

      $scope.$on('$ionicView.enter', function(){
        retrieveLastPage();
        // If valid battlefield retrieved less than 5 seconds ago, re-use it, else, reload
        $scope.cacheTimeInSeconds = 5;
        $scope.getBattlefield($scope.cacheTimeInSeconds, $stateParams.page);
      });

    }]);