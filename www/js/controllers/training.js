/*global angular*/

angular.module('koc.controllers')

.controller('TrainingCtrl', ['$scope', '$stateParams', '$state', '$ionicLoading', '$rootScope', '$ionicPlatform', '$ionicPopup', '$ionicScrollDelegate', '$timeout', '$log', 'User', 'KoC',
function($scope, $stateParams, $state, $ionicLoading, $rootScope, $ionicPlatform, $ionicPopup, $ionicScrollDelegate, $timeout, $log, User, KoC) {

  $log.debug("TrainingCtrl");
  $scope.disableActions = false;

  $scope.buyTotal = 0;
  $scope.soldiersTrained = 0;
  var recalcBuyTotal = function() {
    var cost = 0;
    var soldiers = 0;
    $scope.training.train.forEach(function(program){
      cost     += Number(program.inputValue*program.costPerUnit);
      soldiers += Number(program.inputValue);
    });
    $scope.buyTotal = cost;
    $scope.soldiersTrained = soldiers;
  };

  $scope.trainError = "Loading...";
  var cache = User.getCache("/train", - 1);
  if (cache !== null) {
    $scope.trainError = "";
    $scope.training = cache;
    $scope.personnel = cache.personnel;
    $scope.turing = cache.turing;
    //recalcBuyTotal();
  }

  $scope.trainQuantity = function(index, delta) {
    var currentValue = Number( $scope.training.train[index].inputValue );
    var newValue = currentValue + delta;
    if( newValue < 0) newValue = 0;
    $scope.training.train[index].inputValue = newValue;
    recalcBuyTotal();
  };

  $scope.emptyCart = function () {
    for(var i=0; i<$scope.training.train.length; i++){
      $scope.training.train[i].inputValue = 0;
    }
    $scope.buyTotal = 0;
    $scope.soldiersTrained = 0;
  };

  var train = function(turing, inputNameValue, successMessage, actionMessage) {
    $scope.disableActions = true;
    KoC.trainTroops($scope.training.turing,inputNameValue).success(function(response) {
      if (response.success === true) {
        $scope.training = response.result;
        $scope.personnel = response.result.personnel;
        $scope.turing = response.result.turing;
        if(response.result.message.length)
          $ionicLoading.show({ template: response.result.message, noBackdrop: true, duration: 2000 });
        else
          $ionicLoading.show({ template: successMessage, noBackdrop: true, duration: 1000 });
        $scope.stats = response.stats;
        recalcBuyTotal();
        $log.debug("retrieved the training");
      }
      else {
        $ionicLoading.show({ template: response.error, noBackdrop: true, duration: 2000 });
      }
    }).error(function(error) {
      $ionicLoading.show({ template: "An error occurred " + actionMessage, noBackdrop: true, duration: 2000 });
    }).
    finally(function() {
      $scope.disableActions = false;
      $scope.$broadcast('scroll.refreshComplete');
    });
  };

  $scope.trainTroops = function() {
    $scope.trainError = "";
    var inputNameValue = {};
    $scope.training.train.forEach(function(program){
      inputNameValue[program.inputName] = program.inputValue;
    });
    $log.debug("training troops!", $scope.training.turing, inputNameValue);
    train($scope.training.turing, inputNameValue, "Soldiers trained!", "training troops");
  };

  $scope.upgradeTechnology = function(index) {
    $scope.trainError = "";
    var inputNameValue = {};
    var upgrade = $scope.training.upgrades[index];
    inputNameValue[upgrade.inputName] = upgrade.inputValue;
    $log.debug("upgrading technology!", $scope.training.turing, inputNameValue);
    train($scope.training.turing, inputNameValue, "Upgrade completed!", "upgrading");
  };

  $scope.reloadTraining = function(cacheTimeInSeconds) {
    $log.debug("load the training, cacheTimeInSeconds=" + cacheTimeInSeconds);
    $scope.trainError = "";
    $scope.disableActions = true;
    KoC.getTraining(cacheTimeInSeconds).success(function(response) {
      $log.debug("got the training:", response);
      if (response.success === true) {
        $scope.training = response.result;
        $scope.personnel = response.result.personnel;
        $log.debug("retrieved the training");
        //$rootScope.$broadcast('kocAdvisor', response.help);
      }
      else {
        $scope.trainError = response.error;
      }
    }).error(function(error) {
      $scope.trainError = "An error occurred retrieving the training";
    }).
    finally(function() {
      $log.debug("finally");
      $scope.disableActions = false;
      $scope.$broadcast('scroll.refreshComplete');
      recalcBuyTotal();
    });
  };

  $scope.$on('$ionicView.enter', function(){
    // If valid training retrieved less than 1 minute ago, re-use it, else, reload
    var cacheTimeInSeconds = 60;
    $scope.reloadTraining(cacheTimeInSeconds);
  });

}]);