/*global angular*/

angular.module('koc.controllers')
  .controller('InboxCtrl', ['$scope', '$stateParams', '$state', '$ionicLoading', '$rootScope', '$ionicPlatform', '$ionicPopup', '$ionicScrollDelegate', '$timeout', '$log', '$ionicModal', 'User', 'KoC',
    function ($scope, $stateParams, $state, $ionicLoading, $rootScope, $ionicPlatform, $ionicPopup, $ionicScrollDelegate, $timeout, $log, $ionicModal, User, KoC) {

      $log.debug("InboxCtrl");
      $scope.disableActions = false;
      $scope.inboxError = "";
      $scope.replyError = "";

      $scope.inbox = {
        messages: [],
      };

      $scope.reloadInbox = function () {
        $scope.getInbox();
      };

      $scope.showUserStats = function (userid) {
        if (isFinite(userid) && userid > 0)
          $state.go('app.stats', { userid: userid });
      };

      $scope.getInbox = function (cacheTimeInSeconds) {
        $log.debug("loading the inbox, cacheTimeInSeconds=" + cacheTimeInSeconds);
        $scope.disableActions = true;
        var action = "/inbox";
        var data = {};
        var method = "GET";
        KoC.getPage(method, action, data, cacheTimeInSeconds, true)
          .success(function (response) {
            if (response.success === true) {
              $scope.inbox = response.result.inbox;
              $log.debug("retrieved the inbox");
            }
            else {
              $scope.inboxError = response.error;
            }
          }).error(function (error) {
            $scope.inboxError = "An error occurred retrieving the inbox";
          }).
          finally(function () {
            $log.debug("finished processing inbox");
            $scope.disableActions = false;
            $scope.$broadcast('scroll.refreshComplete');
          });
      };
      
      $scope.messageModal = null;
      $scope.replyModal = null;
      var createModals = function () {

        $ionicModal.fromTemplateUrl('templates/message.html', {
          scope: $scope,
          animation: 'slide-in-down'
        }).then(function (modal) {
          $scope.messageModal = modal;
          $scope.showMessage = function (message) {
            $scope.message = message;
            $scope.messageModal.show();
          };
          $scope.closeMessage = function () {
            $scope.messageModal.hide();
          };
        });

        $ionicModal.fromTemplateUrl('templates/reply.html', {
          scope: $scope,
          animation: 'slide-in-up'
        }).then(function (modal) {
          $scope.replyModal = modal;
          $scope.replyMessage = function () {
            $scope.messageModal.hide();
            $scope.replyModal.show();
          };
          $scope.closeReply = function () {
            $scope.replyModal.hide();
          };
        });
      };
      $timeout(createModals, 1000);

      $scope.replyContent = "";
      $scope.reply = function() {
        $scope.disableActions = true;
        KoC.sendMessage($scope.message.from.userid, "RE: " + $scope.message.subject, $scope.replyContent)
            .success(function(response){
                if (response.success === true) {
                  $scope.inbox = response.result.inbox;
                  $log.debug("sent the message and refreshed the inbox");
                }
                else {
                  $scope.replyError = response.error;
                }
            })
            .error(function(error){
                $scope.replyError = "An error occurred sending the message";
            })
            .finally(function(){
                $scope.disableActions = false;
            });
      };

      $scope.$on('$ionicView.enter', function(){
        $scope.cacheTimeInSeconds = 30;
        $scope.getInbox($scope.cacheTimeInSeconds);
      });

    }]);