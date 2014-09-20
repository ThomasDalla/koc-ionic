/*global angular, ionic*/

angular.module('starter.controllers')

.controller('RecruitCtrl', ['$scope', '$stateParams', '$state', '$ionicLoading', '$rootScope', '$ionicPlatform', '$ionicPopup', '$ionicScrollDelegate', '$ionicModal', '$timeout', '$http', 'User', 'KoC',

  function($scope, $stateParams, $state, $ionicLoading, $rootScope, $ionicPlatform, $ionicPopup, $ionicScrollDelegate, $ionicModal, $timeout, $http, User, KoC) {

    console.log("RecruitCtrl");
    $scope.disableActions = false;
    $scope.recruitError = "";
    $scope.listening = false;
    var found = false;
    $scope.speechRecognitionSupported = ionic.Platform.platform() == "android";
    var speechRecognitionEnabled = User.useSpeechRecognition() && $scope.speechRecognitionSupported;

    var updateRecruit = function(promise) {
      $scope.stopRecognition();
      promise.success(function(response) {
        console.log("got the recruit page:", response);
        if (response.success === true) {
          console.log("retrieved the recruit");
          $scope.recruit = response;
          $scope.recruit.response = "";
          if(response.challenge_url!==undefined)
            $scope.challengeImage = response.image;
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
        $scope.recognizeSpeech();
        found = false;
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

    $scope.sendCaptcha = function() {
      var data = $scope.recruit.hiddenFields;
      console.log("response",$scope.recruit.response);
      data[$scope.recruit.challengeField] = $scope.recruit.challenge;
      data[$scope.recruit.challengeResponseField] = $scope.recruit.response;
      updateRecruit(KoC.postRecruit(data));
      $scope.recruit.response = "";
    };

    // speech
    $scope.startRecognition = function() {
      speechRecognitionEnabled = true;
      $scope.recognizeSpeech();
    };

    $scope.recognizeSpeech = function() {
      // Not supported device => Nothing
      if(!speechRecognitionEnabled) return;
      // Stop recognition if it was already running
      $scope.stopRecognition();

      var maxMatches = 1;
      var language = "en-US";
      $scope.speechMsg = "$scope.listening";
      found = false;
      window.plugins.speechrecognizer.start(resultCallback, errorCallback, maxMatches, language);
      $scope.listening = true;
    };

    $scope.stopRecognition = function() {
      if($scope.listening)
        window.plugins.speechrecognizer.stop(resultCallback, errorCallback);
    };

    var resultCallback = function(result) {
      console.log("msg",result);
      if(result.type=="result") {
        var text = result.results[0][0].transcript;
        $scope.speechMsg = "temp:" + text;
        $scope.stopRecognition();
        if(text=="skip"){
          $ionicLoading.show({ template: "skipping...", noBackdrop: true, duration: 1000 });
          $scope.reloadRecruit();
          return;
        }
        var letter = "";
        switch(text) {
          case "k":
          case "key":
          case "hey":
          case "kate":
            letter = "k"; break;
          case "i":
          case "hi":
          case "aye":
          case "aight":
          case "8":
          case "height":
            letter = "i"; break;
          case "n":
          case "m":
            letter = "n"; break;
          case "g":
            letter = "g"; break;
          case "c":
          case "sea":
          case "see":
          case "6":
          case "six":
            letter = "c"; break;
          case "h":
          case "age":
          case "edge":
            letter = "h"; break;
          case "a":
          case "abc":
          case "letter a":
            letter = "a"; break;
          case "o":
          case "oh":
          case "ow":
          case "owl":
          case "letter o":
            letter = "o"; break;
          case "s":
          case "f":
            letter = "s"; break;
          default:
            letter = "";
        }
        if(letter.length) {
          found = true;
          $ionicLoading.show({ template: letter.toUpperCase(), noBackdrop: true, duration: 1000 });
          $scope.sendLetter(letter);
        }
        else {
          $ionicLoading.show({ template: text + " ??", noBackdrop: true, duration: 1000 });
          $scope.recognizeSpeech();
        }
      }
      else if (result.type == "end" && found === false) {
        console.log("retrying to find (not really)");
        $scope.speechMsg = "end";
        //$scope.recognizeSpeech();
      }
    };

    var errorCallback = function(error) {
      console.log(error);
      $scope.speechErr = "Err: " + error.code;
      if(error.code==7/*||error.code==6*/){
        console.log("should I retry?");
        $ionicLoading.show({ template: "try again", noBackdrop: true, duration: 1000 });
        $scope.recognizeSpeech();
      }
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

    $scope.reloadRecruit();

  }
]);