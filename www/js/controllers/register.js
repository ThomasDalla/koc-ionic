/*global angular*/

angular.module('starter.controllers')

.controller('RegisterCtrl', function($scope, $stateParams, $ionicNavBarDelegate, $ionicLoading, $ionicPopup, $state, KoC, User) {

  $scope.loginData = {};

  var racesCacheTimeInSeconds = 60 * 60 * 24; // 1 day cache (doesn't change often)
  $scope.racesError = "Loading races...";
  KoC.getRaces(racesCacheTimeInSeconds).success(function(response) {
    $scope.racesError = "";
    $scope.races = response.races;
    $scope.kocHost = response.kocHost;
    $scope.selectedRace = $scope.races[0];
  }).error(function(error) {
    $scope.racesError = "Error retrieving the races";
  });
  $scope.changeRace = function(race) {
    $scope.selectedRace = race;
  };

  // Challenge
  $scope.getNewChallenge = function() {
    $scope.captchaError = "Loading...";
    KoC.getPage("GET", "/captcha").success(function(response) {
      $scope.captchaError = "";
      if (response.success) {
        $scope.challenge = response.challenge;
        $scope.challenge_image = response.image;
      }
      else {
        $scope.captchaError = response.error;
      }
    }).error(function(error) {
      $scope.captchaError = "Error retrieving the challenge";
    });
  };
  $scope.getNewChallenge();

  $scope.checkPasswords = function() {
    if ($scope.loginData.password !== undefined && $scope.loginData.password2 !== undefined) {
      if ($scope.loginData.password != $scope.loginData.password2) {
        $scope.registerErrorMessage = "Passwords are different...";
      }
      else {
        $scope.registerErrorMessage = "";
      }
    }
  };

  $scope.register = function() {
    if ($scope.loginData.password !== $scope.loginData.password2) {
      $scope.registerErrorMessage = "Passwords are different...";
    }
    else {
      $ionicLoading.show({
        template: 'Registering...'
      });
      KoC.getPage("POST", "/register", {
        race: $scope.selectedRace.race,
        username: $scope.loginData.username,
        password: $scope.loginData.password,
        email: $scope.loginData.email,
        challenge: $scope.challenge,
        challenge_response: $scope.loginData.challenge_response
      }).success(function(response) {
        $scope.registerErrorMessage = "";
        if (response.success) {
          $scope.registerErrorMessage = "";
          User.set($scope.loginData.username, $scope.loginData.password, response.session, $scope.loginData.email);
          var alertPopup = $ionicPopup.alert({
            title: 'Registered!',
            template: response.message,
            okType: "button-dark"
          });
          alertPopup.then(function(res) {
            $state.go('login');
          });
        }
        else {
          $scope.registerErrorMessage = response.error;
        }
      }).error(function(error) {
        $scope.captchaError = "Error retrieving the challenge";
      })
    .finally(function(){
      $ionicLoading.hide();
    });
    }
  };

});