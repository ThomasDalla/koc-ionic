/*global angular, ionic*/

angular.module('koc.controllers')

  .controller('RecruitCtrl', ['$scope', '$stateParams', '$state', '$ionicLoading', '$rootScope', '$ionicPlatform', '$ionicPopup', '$ionicScrollDelegate', '$ionicModal', '$timeout', '$http', '$log', 'User', 'KoC',
    function ($scope, $stateParams, $state, $ionicLoading, $rootScope, $ionicPlatform, $ionicPopup, $ionicScrollDelegate, $ionicModal, $timeout, $http, $log, User, KoC) {

      $log.debug("RecruitCtrl");
      $scope.disableActions = false;
      $scope.recruitError = "";
      $scope.listening = false;
      var found = false;
      $scope.speechRecognitionSupported = ionic.Platform.platform() == "android";
      $scope.speechRecognitionEnabled = User.useSpeechRecognition() && $scope.speechRecognitionSupported;

      var updateRecruit = function (promise) {
        $scope.stopRecognition();
        promise.success(function (response) {
          $log.debug("got the recruit page:", response);
          if (response.success === true) {
            $log.debug("retrieved the recruit");
            $scope.recruit = response.result;
            $scope.recruit.response = "";
            if (response.result.challenge_url !== undefined)
              $scope.challengeImage = response.result.image;
            //$rootScope.$broadcast('kocAdvisor', response.help);
          }
          else {
            $scope.recruitError = response.error;
          }
        }).error(function (error) {
          $scope.recruitError = "An error occurred retrieving the recruit";
        }).
          finally(function () {
            $scope.disableActions = false;
            $scope.$broadcast('scroll.refreshComplete');
            $scope.recognizeSpeech();
            found = false;
          });
      };

      $scope.reloadRecruit = function () {
        $scope.recruitError = "";
        $scope.disableActions = true;
        updateRecruit(KoC.getRecruit());
      };

      $scope.sendLetter = function (letter) {
        var data = $scope.recruit.hiddenFields;
        data[$scope.recruit.fieldName] = letter;
        updateRecruit(KoC.postRecruit(data));
      };

      $scope.sendCaptcha = function () {
        var data = $scope.recruit.hiddenFields;
        $log.debug("response", $scope.recruit.response);
        data[$scope.recruit.challengeField] = $scope.recruit.challenge;
        data[$scope.recruit.challengeResponseField] = $scope.recruit.response;
        updateRecruit(KoC.postRecruit(data));
        $scope.recruit.response = "";
      };

      // speech
      $scope.startRecognition = function () {
        $scope.speechRecognitionEnabled = true;
        $scope.recognizeSpeech();
      };

      $scope.recognizeSpeech = function () {
        // Not supported device => Nothing
        if (!$scope.speechRecognitionEnabled) return;
        // Stop recognition if it was already running
        $scope.stopRecognition();

        var maxMatches = 1;
        var language = "en-US";
        $scope.speechMsg = "$scope.listening";
        found = false;
        window.plugins.speechrecognizer.start(resultCallback, errorCallback, maxMatches, language);
        $scope.listening = true;
      };

      $scope.stopRecognition = function () {
        if ($scope.listening)
          window.plugins.speechrecognizer.stop(resultCallback, errorCallback);
        $scope.listening = false;
      };

      var resultCallback = function (result) {
        $log.debug("msg", result);
        if (result.type == "result") {
          var text = result.results[0][0].transcript;
          $scope.speechMsg = "temp:" + text;
          $scope.stopRecognition();
          if (text == "skip") {
            $ionicLoading.show({template: "skipping...", noBackdrop: true, duration: 1000});
            $scope.reloadRecruit();
            return;
          }
          var letter = "";
          switch (text) {
            case "k":
            case "key":
            case "hey":
            case "kate":
              letter = "k";
              break;
            case "i":
            case "hi":
            case "aye":
            case "aight":
            case "8":
            case "height":
              letter = "i";
              break;
            case "n":
            case "m":
              letter = "n";
              break;
            case "g":
              letter = "g";
              break;
            case "c":
            case "sea":
            case "see":
            case "6":
            case "six":
            case "seat":
              letter = "c";
              break;
            case "h":
            case "age":
            case "edge":
              letter = "h";
              break;
            case "a":
            case "abc":
            case "letter a":
            case "literaki":
              letter = "a";
              break;
            case "o":
            case "oh":
            case "ow":
            case "owl":
            case "letter o":
              letter = "o";
              break;
            case "s":
            case "f":
              letter = "s";
              break;
            default:
              letter = "";
          }
          if (letter.length) {
            found = true;
            $ionicLoading.show({template: letter.toUpperCase(), noBackdrop: true, duration: 1000});
            $scope.sendLetter(letter);
          }
          else {
            $ionicLoading.show({template: text + " ??", noBackdrop: true, duration: 1000});
            $scope.recognizeSpeech();
          }
        }
        else if (result.type == "end" && found === false) {
          $log.debug("retrying to find (not really)");
          $scope.speechMsg = "end";
          //$scope.recognizeSpeech();
        }
      };

      var errorCallback = function (error) {
        $log.debug(error);
        $scope.speechErr = "Err: " + error.code;
        if (error.code == 7/*||error.code==6*/) {
          $log.debug("should I retry?");
          $ionicLoading.show({template: "try again", noBackdrop: true, duration: 1000});
          $scope.recognizeSpeech();
        }
      };

      // Show the list of the supported languages
      $scope.getSupportedLanguages = function () {
        window.plugins.speechrecognizer.getSupportedLanguages(function (languages) {
          // display the json array
          $scope.speechMsg = languages;
        }, function (error) {
          $scope.speechErr = "Could not retrieve the supported languages : " + error;
        });
      };

      $scope.reloadRecruit();

    }
  ]);