/*global angular*/

angular.module('starter.controllers')

.controller('TrainingCtrl', ['$scope', '$stateParams', '$state', '$ionicLoading', '$rootScope', '$ionicPlatform', '$ionicPopup', '$ionicScrollDelegate', '$timeout', 'User', 'KoC',

function($scope, $stateParams, $state, $ionicLoading, $rootScope, $ionicPlatform, $ionicPopup, $ionicScrollDelegate, $timeout, User, KoC) {

  console.log("TrainingCtrl");
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
  User.getCache("/train", - 1).success(function(response) {
    if (response !== null) {
      $scope.trainError = "";
      $scope.training = response.training;
      $scope.personnel = response.training.personnel;
      $scope.turing = response.training.turing;
      recalcBuyTotal();
    }
  }).error(function(error) {
    $scope.trainError = error.toString();
  });

  $scope.trainQuantity = function(index, delta) {
    var currentValue = Number( $scope.training.train[index].inputValue );
    var newValue = currentValue + delta;
    if( newValue < 0) newValue = 0;
    $scope.training.train[index].inputValue = newValue;
    recalcBuyTotal();
  };

  var train = function(turing, inputNameValue, successMessage, actionMessage) {
    $scope.disableActions = true;
    KoC.trainTroops($scope.training.turing,inputNameValue).success(function(response) {
      if (response.success === true) {
        $scope.training = response.training;
        $scope.personnel = response.training.personnel;
        if(response.training.message.length)
          $ionicLoading.show({ template: response.training.message, noBackdrop: true, duration: 1000 });
        else
          $ionicLoading.show({ template: successMessage, noBackdrop: true, duration: 1000 });
        $scope.stats = response.stats;
        recalcBuyTotal();
        console.log("retrieved the training");
      }
      else {
        $ionicLoading.show({ template: response.error, noBackdrop: true, duration: 1000 });
      }
    }).error(function(error) {
      $ionicLoading.show({ template: "An error occurred " + actionMessage, noBackdrop: true, duration: 1000 });
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
    console.log("training troops!", $scope.training.turing, inputNameValue);
    train($scope.training.turing, inputNameValue, "Soldiers trained!", "training troops");
  };

  $scope.reloadTraining = function(cacheTimeInSeconds) {
    console.log("load the training, cacheTimeInSeconds=" + cacheTimeInSeconds);
    $scope.trainError = "";
    $scope.disableActions = true;
    KoC.getTraining(cacheTimeInSeconds).success(function(response) {
      if (response.success === true) {
        $scope.training = response.training;
        $scope.personnel = response.training.personnel;
        console.log("retrieved the training");
        //$rootScope.$broadcast('kocAdvisor', response.help);
      }
      else {
        $scope.trainError = response.error;
      }
    }).error(function(error) {
      $scope.trainError = "An error occurred retrieving the training";
    }).
    finally(function() {
      console.log("finally");
      $scope.disableActions = false;
      $scope.$broadcast('scroll.refreshComplete');
      recalcBuyTotal();
    });
  };

  // If valid training retrieved less than 5 minutes ago, re-use it, else, reload
  var cacheTimeInSeconds = 60 * 5;
  $scope.reloadTraining(cacheTimeInSeconds);

}]);