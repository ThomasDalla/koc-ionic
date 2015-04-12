/*global angular*/

angular.module('koc.controllers')

  .controller('ArmoryCtrl', ['$scope', '$stateParams', '$state', '$ionicLoading', '$rootScope', '$ionicPlatform', '$ionicPopup', '$ionicScrollDelegate', '$timeout', '$log', 'User', 'KoC',
    function ($scope, $stateParams, $state, $ionicLoading, $rootScope, $ionicPlatform, $ionicPopup, $ionicScrollDelegate, $timeout, $log, User, KoC) {

      $log.debug("ArmoryCtrl");
      $scope.disableActions = false;

      $scope.weaponTypes = [
        'Attack Weapons',
        'Defense Weapons',
        'Spy Tools',
        'Sentry Tools',
      ];

      $scope.armoryError = "Loading...";
      var cache = User.getCache("/armory", -1);
      if(cache !== null) {
        $scope.armoryError = "";
        $scope.armory = cache.armory;
        //$scope.recalcBuyTotal();
      }

      $scope.sellWeapon = function (weapon) {
        var weaponName = weapon.name;
        var qty = $scope.sellWeapons[weaponName] || 1;
        var inputName = weapon.sell.inputName;
        var data = {};
        data[inputName] = qty;
        $log.debug("selling " + weapon.name, $scope.armory.turing, data);
        buyWeapons($scope.armory.turing, data, qty + " " + weaponName + " sold!", "selling " + qty + " " + weaponName);
      };

      $scope.repairWeapon = function (weapon) {
        var inputName = weapon.repair.inputName;
        var qty = weapon.repair.defaultValue;
        var data = {};
        data[inputName] = qty;
        $log.debug("repairing " + weapon.name, $scope.armory.turing, data);
        buyWeapons($scope.armory.turing, data, weapon.name + " repaired!", "repairing " + weapon.name);
      };

      $scope.upgradeFortification = function () {
        var data = {upgrade_siege: 'yes'};
        data[$scope.armory.upgrades.fortification.inputName] = $scope.armory.upgrades.fortification.inputValue;
        $log.debug("upgrading fortification", $scope.armory.turing, data);
        buyWeapons($scope.armory.turing, data, "Fortification upgraded!", "upgrading fortification");
      };

      $scope.upgradeSiegeTechnology = function () {
        var data = {upgrade_siege: 'yes'};
        data[$scope.armory.upgrades.siegeTechnology.inputName] = $scope.armory.upgrades.siegeTechnology.inputValue;
        $log.debug("upgrading Siege Technology", $scope.armory.turing, data);
        buyWeapons($scope.armory.turing, data, "Siege Technology upgraded!", "upgrading Siege Technology");
      };

      $scope.repairAll = function () {
        var data = {};
        data[$scope.armory.repairAll.inputName] = "Repair all weapons for " + $scope.armory.repairAll.priceText + " Gold";
        $log.debug("repairing weapons!", $scope.armory.turing, data);
        buyWeapons($scope.armory.turing, data, "Weapons repaired!", "repairing weapons");
      };

      var buyWeapons = function (turing, inputNameValue, successMessage, actionMessage) {
        $scope.disableActions = true;
        KoC.buyWeapons($scope.armory.turing, inputNameValue).success(function (response) {
          if (response.success === true) {
            $scope.armory = response.result.armory;
            if ($scope.armory.error.length)
              $ionicLoading.show({template: $scope.armory.error, noBackdrop: true, duration: 2000});
            else
              $ionicLoading.show({template: successMessage, noBackdrop: true, duration: 600});
            $scope.stats = response.stats;
            $scope.recalcBuyTotal();
            $log.debug("retrieved the armory");
            $rootScope.$broadcast('kocAdvisor', response.help);
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

      $scope.buyWeapons = function () {
        $scope.armoryError = "";
        var inputNameValue = $scope.getInputNameValue();
        $log.debug("buying weapons!", $scope.armory.turing, inputNameValue);
        buyWeapons($scope.armory.turing, inputNameValue, "Weapons bought!", "buying weapons");
      };

      $scope.sellWeapons = {};
      $scope.sellWeaponQuantity = function (weapon, delta) {
        var weaponName = weapon.name;
        var max = weapon.quantity;
        if ($scope.sellWeapons[weaponName] === undefined)
          $scope.sellWeapons[weaponName] = 0;
        if ($scope.sellWeapons[weaponName] + delta < 0)
          $scope.sellWeapons[weaponName] = 0;
        else if ($scope.sellWeapons[weaponName] + delta > max)
          $scope.sellWeapons[weaponName] = max;
        else
          $scope.sellWeapons[weaponName] = $scope.sellWeapons[weaponName] + delta;
        //$log.debug($scope.sellWeapons[weaponName]);
      };

      $scope.buyTotal = 0;
      $scope.buyWeaponQuantity = function (weapon, delta) {
        weapon.inputValue += delta;
        if (weapon.inputValue < 0)
          weapon.inputValue = 0;
        $scope.recalcBuyTotal();
      };

      $scope.recalcBuyTotal = function () {
        var total = 0;
        $scope.weaponsToBuy().forEach(function (weapon) {
          total += weapon.inputValue * weapon.price;
        });
        $scope.buyTotal = total;
      };

      $scope.emptyCart = function () {
        $scope.weaponTypes.forEach(function (weaponType) {
          for(var i=0;i<$scope.armory.buyWeapons[weaponType].length;i++){
            $scope.armory.buyWeapons[weaponType][i].inputValue = 0;
          }
        });
        $scope.buyTotal = 0;
      };

      $scope.weaponsToBuy = function () {
        var weapons = [];
        $scope.weaponTypes.forEach(function (weaponType) {
          $scope.armory.buyWeapons[weaponType].forEach(function (weapon) {
            if (weapon.inputValue > 0) {
              weapons.push(weapon);
            }
          });
        });
        return weapons;
      };

      $scope.getInputNameValue = function () {
        var weapons = {};
        $scope.weaponsToBuy().forEach(function (weapon) {
          weapons[weapon.inputName] = weapon.inputValue;
        });
        return weapons;
      };

      $scope.reloadArmory = function (cacheTimeInSeconds) {
        $log.debug("load the armory, cacheTimeInSeconds=" + cacheTimeInSeconds);
        $scope.armoryError = "";
        $scope.disableActions = true;
        KoC.getArmory(cacheTimeInSeconds).success(function (response) {
          if (response.success === true) {
            $scope.armory = response.result.armory;
            $scope.stats = response.stats;
            $scope.recalcBuyTotal();
            $log.debug("retrieved the armory");
            //$rootScope.$broadcast('kocAdvisor', response.help);
          }
          else {
            $scope.armoryError = response.error;
          }
        }).error(function (error) {
          $scope.armoryError = "An error occurred retrieving the armory";
        }).
          finally(function () {
            $log.debug("finally");
            $scope.disableActions = false;
            $scope.$broadcast('scroll.refreshComplete');
          });
      };

      $scope.showBestWeaponsOnly = User.showBestWeaponsOnly();
      $scope.filterWeaponByStrength = function(item) {
        return !!(!$scope.showBestWeaponsOnly
        || (item.strengthMax !== undefined && item.strengthMax >= 1000 )
        || (item.price !== undefined && item.price >= 1e6) );
      };
      $scope.showBestWeaponsOnlyChange = function() {
        $scope.showBestWeaponsOnly = !$scope.showBestWeaponsOnly;
        User.showBestWeaponsOnly($scope.showBestWeaponsOnly);
        $ionicScrollDelegate.scrollTop();
      };

      $scope.$on('$ionicView.enter', function(){
        var cacheTimeInSeconds = 5;
        $scope.reloadArmory(cacheTimeInSeconds);
      });

    }]);