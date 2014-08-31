/*global angular*/

angular.module('starter.controllers')

.controller('ArmoryCtrl', ['$scope', '$stateParams', '$state', '$ionicLoading', '$rootScope', '$ionicPlatform', '$ionicPopup', '$ionicScrollDelegate', '$timeout', 'User', 'KoC',

function($scope, $stateParams, $state, $ionicLoading, $rootScope, $ionicPlatform, $ionicPopup, $ionicScrollDelegate, $timeout, User, KoC) {

  console.log("ArmoryCtrl");
  $scope.disableActions = false;

  $scope.weaponTypes = [
    'Attack Weapons',
    'Defense Weapons',
    'Spy Tools',
    'Sentry Tools',
  ];

  $scope.armoryError = "Loading...";
  User.getCache("/armory", - 1).success(function(response) {
    if (response !== null) {
      $scope.armoryError = "";
      $scope.armory = response.armory;
      $scope.recalcBuyTotal();
    }
  }).error(function(error) {
    $scope.armoryError = error.toString();
  });

  $scope.sellWeapon = function(weapon) {
    var weaponName = weapon.name;
    var qty = $scope.sellWeapons[weaponName] || 1;
    var inputName = weapon.sell.inputName;
    var data ={};
    data[inputName] = qty;
    console.log("selling " + weapon.name, $scope.armory.turing, data);
    buyWeapons($scope.armory.turing, data, qty + " " + weaponName + " sold!", "selling " + qty + " " + weaponName);
  };

  $scope.repairWeapon = function(weapon) {
    var inputName = weapon.repair.inputName;
    var qty = weapon.repair.defaultValue;
    var data ={};
    data[inputName] = qty;
    console.log("repairing " + weapon.name, $scope.armory.turing, data);
    buyWeapons($scope.armory.turing, data, weapon.name + " repaired!", "repairing " + weapon.name);
  };

  $scope.upgradeFortification = function() {
    var data = { upgrade_siege: 'yes' };
    data[$scope.armory.upgrades.fortification.inputName] = $scope.armory.upgrades.fortification.inputValue;
    console.log("upgrading fortification", $scope.armory.turing, data);
    buyWeapons($scope.armory.turing, data,"Fortification upgraded!", "upgrading fortification");
  };

  $scope.upgradeSiegeTechnology = function() {
    var data = { upgrade_siege: 'yes' };
    data[$scope.armory.upgrades.siegeTechnology.inputName] = $scope.armory.upgrades.siegeTechnology.inputValue;
    console.log("upgrading Siege Technology", $scope.armory.turing, data);
    buyWeapons($scope.armory.turing, data,"Siege Technology upgraded!", "upgrading Siege Technology");
  };

  $scope.repairAll = function() {
    var data ={};
    data[$scope.armory.repairAll.inputName] = "Repair all weapons for " + $scope.armory.repairAll.priceText + " Gold";
    console.log("repairing weapons!", $scope.armory.turing, data);
    buyWeapons($scope.armory.turing, data, "Weapons repaired!", "repairing weapons");
  };

  var buyWeapons = function(turing, inputNameValue, successMessage, actionMessage) {
    $scope.disableActions = true;
    KoC.buyWeapons($scope.armory.turing,inputNameValue).success(function(response) {
      if (response.success === true) {
        $scope.armory = response.armory;
        if(response.armory.error.length)
          $ionicLoading.show({ template: response.armory.error, noBackdrop: true, duration: 2000 });
        else
          $ionicLoading.show({ template: successMessage, noBackdrop: true, duration: 2000 });
        $scope.stats = response.stats;
        $scope.recalcBuyTotal();
        console.log("retrieved the armory");
        $rootScope.$broadcast('kocAdvisor', response.help);
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

  $scope.buyWeapons = function() {
    $scope.armoryError = "";
    var inputNameValue = $scope.getInputNameValue();
    console.log("buying weapons!", $scope.armory.turing, inputNameValue);
    buyWeapons($scope.armory.turing, inputNameValue, "Weapons bought!", "buying weapons");
  };

  $scope.sellWeapons = {};
  $scope.sellWeaponQuantity = function( weapon, delta ) {
    var weaponName = weapon.name;
    var max = weapon.quantity;
    if($scope.sellWeapons[weaponName]===undefined)
      $scope.sellWeapons[weaponName] = 1;
    if($scope.sellWeapons[weaponName] + delta < 1 )
      $scope.sellWeapons[weaponName] = 1;
    else if($scope.sellWeapons[weaponName] + delta > max)
      $scope.sellWeapons[weaponName] = max;
    else
      $scope.sellWeapons[weaponName] = $scope.sellWeapons[weaponName] + delta;
    console.log($scope.sellWeapons[weaponName]);
  };

  $scope.buyTotal = 0;
  $scope.buyWeaponQuantity = function( weapon, delta ) {
    weapon.inputValue += delta;
    if( weapon.inputValue < 0 )
      weapon.inputValue = 0;
    $scope.recalcBuyTotal();
  };

  $scope.recalcBuyTotal = function(){
    var total = 0;
    $scope.weaponsToBuy().forEach(function(weapon){
      total += weapon.inputValue*weapon.price;
    });
    $scope.buyTotal = total;
  };

  $scope.weaponsToBuy = function() {
    var weapons = [];
    $scope.weaponTypes.forEach(function(weaponType){
      $scope.armory.buyWeapons[weaponType].forEach(function(weapon){
        if(weapon.inputValue>0){
          weapons.push(weapon);
        }
      });
    });
    return weapons;
  };

  $scope.getInputNameValue = function() {
    var weapons = {};
    $scope.weaponsToBuy().forEach(function(weapon){
      weapons[weapon.inputName] = weapon.inputValue;
    });
    return weapons;
  };

  $scope.reloadArmory = function(cacheTimeInSeconds) {
    console.log("load the armory, cacheTimeInSeconds=" + cacheTimeInSeconds);
    $scope.armoryError = "";
    $scope.disableActions = true;
    KoC.getArmory(cacheTimeInSeconds).success(function(response) {
      if (response.success === true) {
        $scope.armory = response.armory;
        $scope.stats = response.stats;
        $scope.recalcBuyTotal();
        console.log("retrieved the armory");
        $rootScope.$broadcast('kocAdvisor', response.help);
      }
      else {
        $scope.armoryError = response.error;
      }
    }).error(function(error) {
      $scope.armoryError = "An error occurred retrieving the armory";
    }).
    finally(function() {
      console.log("finally");
      $scope.disableActions = false;
      $scope.$broadcast('scroll.refreshComplete');
    });
  };

  // If valid armory retrieved less than 5 minutes ago, re-use it, else, reload
  var cacheTimeInSeconds = 60 * 5;
  $scope.reloadArmory(cacheTimeInSeconds);

}]);