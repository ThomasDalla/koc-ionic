/*global angular, ionic*/

angular.module('koc.controllers')

  .controller('HelpCtrl', ['$scope', '$stateParams', '$state', '$ionicLoading', '$rootScope', '$ionicScrollDelegate', '$log', 'User', 'KoC',
    function ($scope, $stateParams, $state, $ionicLoading, $rootScope, $ionicScrollDelegate, $log, User, KoC) {

      $log.debug("HelpCtrl");

      $scope.previousHelp = [];
      $scope.title = "Main";
      $scope.titles = [];
      $scope.currentLevel = "";
      $rootScope.$broadcast('kocAdvisor', "");

      $scope.updateCurrentLevel = function () {
        var output = [];
        $scope.titles.forEach(function (title) {
          output.push(title);
        });
        $scope.currentLevel = output.join(" > ");
        $ionicScrollDelegate.scrollTop();
      };

      var cache = User.getCache("/help", -1);
      if(cache !== null)
        $scope.items = cache.data;

      // $log.debug($state);
      // $log.debug($stateParams);

      $scope.subHelp = function (index) {
        $scope.previousHelp.push($scope.items);
        $scope.title = $scope.items[index].title || "";
        $scope.help = $scope.items[index].help || "";
        $scope.titles.push($scope.items[index].title);
        $scope.items = $scope.items[index].sections || [];
        $scope.updateCurrentLevel();
      };

      $scope.upHelp = function () {
        if ($scope.previousHelp.length) {
          $scope.items = $scope.previousHelp.pop();
          $scope.title = $scope.items.title || "Main";
          $scope.help = $scope.items.help || "";
          $scope.titles.pop();
          $scope.updateCurrentLevel();
        }
      };

      $scope.reloadHelp = function (cacheTimeInSeconds) {
        $log.debug("load the help, cacheTimeInSeconds=" + cacheTimeInSeconds);
        $scope.helpError = "";
        KoC.getHelp(cacheTimeInSeconds).success(function (response) {
          if (response instanceof Array) {
            // Got it from remote
            User.setPageRetrieved("/help", {data: response});
            $log.debug(response);
            $scope.items = response;
            $log.debug("retrieved the help from remote");
          }
          else if (response instanceof Object) {
            // Got it from the cache
            $scope.items = response.data;
            $log.debug("retrieved the help from the cache");
          }
          else {
            $scope.helpError = response.error || "Error retrieving help";
          }
        }).error(function (error) {
          $scope.helpError = "An error occurred retrieving the help";
        });
      };

      // If valid base retrieved less than 5 minutes ago, re-use it, else, reload
      var cacheTimeInSeconds = 60 * 5;
      $scope.reloadHelp(cacheTimeInSeconds);

      $scope.$on('kocHelpBack', function (event) {
        $scope.upHelp();
      });

    }]);