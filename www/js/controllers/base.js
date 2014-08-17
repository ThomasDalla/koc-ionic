/*global angular*/

angular.module('starter.controllers')

.controller('BaseCtrl', ['$scope', '$stateParams', '$state', '$ionicLoading', '$rootScope', '$ionicPlatform', '$ionicPopup', '$ionicScrollDelegate', '$timeout', 'User', 'KoC',

function($scope, $stateParams, $state, $ionicLoading, $rootScope, $ionicPlatform, $ionicPopup, $ionicScrollDelegate, $timeout, User, KoC) {

  console.log("BaseCtrl");

  $scope.baseError = "Loading...";
  User.getCache("/base", - 1).success(function(response) {
    if (response !== null) {
      $scope.baseError = "";
      $scope.base = response;
    }
  }).error(function(error) {
    $scope.baseError = error.toString();
  }); // by default when opening, get it from the cache
  //$cordovaToast.show('Here is a message', 'long', 'center');
  //$ionicLoading.show({ template: 'MEssage', noBackdrop: true, duration: 2000 });

  $scope.showUserStats = function(userid) {
    if (isFinite(userid) && userid > 0) $state.go('app.stats', {
      userid: userid
    });
  };

  $scope.reloadBase = function(cacheTimeInSeconds) {
    console.log("load the base, cacheTimeInSeconds=" + cacheTimeInSeconds);
    $scope.baseError = "";
    KoC.getBase(cacheTimeInSeconds).success(function(response) {
      if (response.success === true) {
        //User.setBase(response.user);
        $scope.base = response.user;
        console.log("retrieved the base");
        $rootScope.$broadcast('kocAdvisor', response.help);
        // current race features
        if ($scope.races !== undefined && $scope.races.length && response.user.userInfo !== undefined) {
          $scope.races.forEach(function(race) {
            if (race.race == response.user.userInfo.race) $scope.currentRaceFeatures = race.features;
          });
        }
        //$ionicLoading.show({ template: 'Retrieved the base', noBackdrop: true, duration: 1000 });
      }
      else {
        $scope.baseError = response.error;
      }
    }).error(function(error) {
      $scope.baseError = "An error occurred retrieving the base";
    }).
    finally(function() {
      console.log("finally");
      //$ionicLoading.hide();
      // Stop the ion-refresher from spinning
      $scope.$broadcast('scroll.refreshComplete');
    });
  };

  // If valid base retrieved less than 5 minutes ago, re-use it, else, reload
  var cacheTimeInSeconds = 60 * 5;
  $scope.reloadBase(cacheTimeInSeconds);

  // Load races (for race change)
  var racesCacheTimeInSeconds = 60 * 60 * 24; // 1 day cache (doesn't change often)
  $scope.racesError = "Loading races...";
  KoC.getRaces(racesCacheTimeInSeconds).success(function(response) {
    $scope.racesError = "";
    $scope.races = response.races;
    $scope.kocHost = response.kocHost;
    // current race features
    if ($scope.base !== undefined && $scope.base.userInfo !== undefined) {
      response.races.forEach(function(race) {
        if (race.race == $scope.base.userInfo.race) $scope.currentRaceFeatures = race.features;
      });
    }
  }).error(function(error) {
    $scope.racesError = "Error retrieving the races";
  });
  $scope.selectRace = function(race) {
    if ($scope.selectedRace === undefined || $scope.selectedRace === null) {
      $timeout(function() {
        $ionicScrollDelegate.scrollBottom();
      }, 1000);
    }
    $scope.selectedRace = race;
  };

  $scope.changeRace = function() {
    KoC.changeRace($scope.selectedRace.race).success(function(response) {
      if (response.success) {
        $scope.base = response.user;
        $scope.selectedRace = undefined;
        $scope.races.forEach(function(race) {
          if (race.race == $scope.base.userInfo.race) $scope.currentRaceFeatures = race.features;
        });
        $ionicLoading.show({
          template: 'Race changed!',
          noBackdrop: true,
          duration: 2000
        });
      }
      else {
        $scope.racesError = response.error;
      }
    }).error(function() {
      $scope.racesError = "An error occurred changing race";
    });
  };

  $scope.nbTimesCanChangeCommander = 0;
  $scope.canChangeCommander = false;

  // Check if we can change commander
  KoC.getChangeCommanderInfo().success(function(response) {
    if (response.success && response.commanderChange !== undefined && response.commanderChange.success) {
      $rootScope.nbTimesCanChangeCommander = response.commanderChange.nbTimesCanChangeCommander;
      $rootScope.canChangeCommander = $rootScope.nbTimesCanChangeCommander > 0;
      $scope.nbTimesCanChangeCommander = response.commanderChange.nbTimesCanChangeCommander;
      $scope.canChangeCommander = $scope.nbTimesCanChangeCommander > 0;
    }
  });

  $scope.ditchCommander = function() {
    // confirm first
    $ionicPopup.confirm({
      title: 'Ditch Commander?',
      template: 'You can change your commander only ' + $scope.nbTimesCanChangeCommander + ' more times.<br>Are you sure you want to ditch your commander now?'
    }).then(function(res) {
      if (res) {
        // change commander
        KoC.ditchCommander().success(function(response) {
          if (response.success) {
            $ionicLoading.show({
              template: "You ditched your commander!",
              noBackdrop: true,
              duration: 2000
            });
          }
          else {
            $ionicLoading.show({
              template: response.error,
              noBackdrop: true,
              duration: 2000
            });
          }
        }).error(function() {
          $ionicLoading.show({
            template: 'An error occurred ditching your commander',
            noBackdrop: true,
            duration: 2000
          });
        });
      }
      else {
        $ionicLoading.show({
          template: 'Commander NOT Ditched',
          noBackdrop: true,
          duration: 1000
        });
      }
    });
  };

}]);