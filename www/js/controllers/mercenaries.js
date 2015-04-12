/*global angular*/

angular.module('koc.controllers')

  .controller('MercenariesCtrl', ['$scope', '$stateParams', '$state', '$ionicLoading', '$rootScope', '$ionicPlatform', '$ionicPopup', '$ionicScrollDelegate', '$timeout', '$log', 'User', 'KoC',
    function ($scope, $stateParams, $state, $ionicLoading, $rootScope, $ionicPlatform, $ionicPopup, $ionicScrollDelegate, $timeout, $log, User, KoC) {

      $log.debug("MercenariesCtrl");
      $scope.disableActions = false;

      $scope.buyTotal = 0;
      $scope.mercsHired = 0;
      var recalcBuyTotal = function () {
        var cost = 0;
        var soldiers = 0;
        $scope.mercenaries.hire.forEach(function (program) {
          cost += Number(program.inputValue * program.costPerUnit);
          soldiers += Number(program.inputValue);
        });
        $scope.buyTotal = cost;
        $scope.mercsHired = soldiers;
      };

      $scope.mercsError = "Loading...";
      var cache = User.getCache("/mercenaries", -1);
      if(cache !== null) {
        $scope.mercsError = "";
        $scope.mercenaries = cache;
        $scope.personnel = cache.personnel;
        $scope.turing = cache.turing;
        //recalcBuyTotal();
      }

      $scope.emptyCart = function () {
        for(var i=0; i<$scope.mercenaries.hire.length; i++){
          $scope.mercenaries.hire[i].inputValue = 0;
        }
        $scope.buyTotal = 0;
        $scope.mercsHired = 0;
      };

      $scope.hireQuantity = function (index, delta) {
        var currentProgram = $scope.mercenaries.hire[index];
        var currentValue = Number(currentProgram.inputValue);
        var quantityAvailable = currentProgram.quantityAvailable;
        var newValue = currentValue + delta;
        if (newValue < 0) newValue = 0;
        if (newValue > quantityAvailable) newValue = quantityAvailable;
        $scope.mercenaries.hire[index].inputValue = newValue;
        recalcBuyTotal();
      };

      var hire = function (turing, inputNameValue, successMessage, actionMessage) {
        $scope.disableActions = true;
        KoC.hireMercenaries($scope.mercenaries.turing, inputNameValue).success(function (response) {
          if (response.success === true) {
            $scope.mercenaries = response.result;
            $scope.personnel = response.result.personnel;
            $scope.turing = response.result.turing;
            if (response.result.message.length)
              $ionicLoading.show({template: response.result.message, noBackdrop: true, duration: 2000});
            else
              $ionicLoading.show({template: successMessage, noBackdrop: true, duration: 1000});
            $scope.stats = response.stats;
            recalcBuyTotal();
            $log.debug("retrieved the mercenaries");
          }
          else {
            $ionicLoading.show({template: response.error, noBackdrop: true, duration: 2000});
          }
        }).error(function (error) {
          $ionicLoading.show({template: "An error occurred " + actionMessage, noBackdrop: true, duration: 2000});
        }).
          finally(function () {
            $scope.disableActions = false;
            $scope.$broadcast('scroll.refreshComplete');
          });
      };

      $scope.hireMercs = function () {
        $scope.mercsError = "";
        var inputNameValue = {};
        $scope.mercenaries.hire.forEach(function (program) {
          inputNameValue[program.inputName] = program.inputValue;
        });
        $log.debug("hiring mercenaries!", $scope.mercenaries.turing, inputNameValue);
        hire($scope.mercenaries.turing, inputNameValue, "Mercenaries hired!", "hiring mercenaries");
      };

      $scope.reloadMercenaries = function (cacheTimeInSeconds) {
        $log.debug("load the mercenaries, cacheTimeInSeconds=" + cacheTimeInSeconds);
        $scope.mercsError = "";
        $scope.disableActions = true;
        KoC.getMercenaries(cacheTimeInSeconds).success(function (response) {
          $log.debug("got the mercs:", response);
          if (response.success === true) {
            $scope.mercenaries = response.result;
            $scope.personnel = response.result.personnel;
            $log.debug("retrieved the mecenaries");
            //$rootScope.$broadcast('kocAdvisor', response.help);
          }
          else {
            $scope.mercsError = response.error;
          }
        }).error(function (error) {
          $scope.mercsError = "An error occurred retrieving the mercenaries";
        }).
          finally(function () {
            $log.debug("finally");
            $scope.disableActions = false;
            $scope.$broadcast('scroll.refreshComplete');
            recalcBuyTotal();
          });
      };

      $scope.$on('$ionicView.enter', function(){
        // If valid mercenaries retrieved less than 5 minutes ago, re-use it, else, reload
        var cacheTimeInSeconds = 60 * 5;
        $scope.reloadMercenaries(cacheTimeInSeconds);
      });

    }]);