/*global angular*/

angular.module('starter.controllers')

.controller('RecruitCtrl', ['$scope', '$stateParams', '$state', '$ionicLoading', '$rootScope', '$ionicPlatform', '$ionicPopup', '$ionicScrollDelegate', '$timeout', '$http', 'User', 'KoC',

  function($scope, $stateParams, $state, $ionicLoading, $rootScope, $ionicPlatform, $ionicPopup, $ionicScrollDelegate, $timeout, $http, User, KoC) {

    console.log("RecruitCtrl");
    $scope.disableActions = false;
    $scope.recruitError = "";

    var updateRecruit = function(promise) {
      promise.success(function(response) {
        console.log("got the recruit page:", response);
        if (response.success === true) {
          $scope.recruit = response;
          console.log("retrieved the recruit");
          //$rootScope.$broadcast('kocAdvisor', response.help);
        }
        else {
          $scope.recruitError = response.error;
        }
      }).error(function(error) {
        $scope.recruitError = "An error occurred retrieving the recruit";
      }).
      finally(function() {
        $scope.disableActions = false;
        $scope.$broadcast('scroll.refreshComplete');
      });
    };

    $scope.reloadRecruit = function() {
      $scope.recruitError = "";
      $scope.disableActions = true;
      updateRecruit(KoC.getRecruit());
    };

    $scope.sendLetter = function(letter) {
      var data = $scope.recruit.hiddenFields;
      data[$scope.recruit.fieldName] = letter;
      updateRecruit(KoC.postRecruit(data));
    };

    $scope.reloadRecruit();


    // speech

    $scope.recognizeSpeech = function() {
      var maxMatches = 1;
      var language = "en-US";
      $scope.speechMsg = "started";
      window.plugins.speechrecognizer.start(resultCallback, errorCallback, maxMatches, language);
    };

    $scope.stopRecognition = function() {
      window.plugins.speechrecognizer.stop(resultCallback2, errorCallback2);
    };

    var resultCallback = function(result) {
      console.log(result);
      $scope.speechMsg = "temp:" + result.results[0][0].transcript;
    };

    var errorCallback = function(error) {
      console.log(error);
      $scope.speechErr = "Err: " + error;
    };

    var resultCallback2 = function(result) {
      console.log("msg2",result);
      $scope.speechMsg = "final: " + result.results[0][0].transcript;
      $scope.stopRecognition();
    };

    var errorCallback2 = function(error) {
      console.log(error);
      $scope.speechErr = "Err2: " + error;
    };

    // Show the list of the supported languages
    $scope.getSupportedLanguages = function() {
      window.plugins.speechrecognizer.getSupportedLanguages(function(languages) {
        // display the json array
        $scope.speechMsg = languages;
      }, function(error) {
        $scope.speechErr = "Could not retrieve the supported languages : " + error;
      });
    };

  }
]);