/*global angular*/

angular.module('koc.controllers')
  .controller('InboxCtrl', ['$scope', '$stateParams', '$state', '$ionicLoading', '$rootScope', '$ionicPlatform', '$ionicPopup', '$ionicScrollDelegate', '$timeout', '$log', '$ionicModal', 'User', 'KoC',
    function ($scope, $stateParams, $state, $ionicLoading, $rootScope, $ionicPlatform, $ionicPopup, $ionicScrollDelegate, $timeout, $log, $ionicModal, User, KoC) {

      $log.debug("InboxCtrl");
      $scope.disableActions = false;
      $scope.inboxError = "";
      $scope.replyError = "";

      $scope.inbox = {
        messages: []
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
            if(response===undefined){
              var errMsg = "Could not retrieve the inbox (logout and retry?)";
              $scope.inboxError = errMsg;
              $log.error(errMsg);
            }
            else if (response.success === true) {
              $scope.inbox = response.result.inbox;
              $log.debug("retrieved the inbox");
            }
            else {
              $scope.inboxError = response.error;
              $log.error(response.error);
            }
          })
          .error(function (error) {
              var errMsg = "An error occurred retrieving the inbox";
              $scope.inboxError = errMsg;
              $log.error(errMsg);
          })
          .finally(function () {
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
            $scope.replyContent = "";
            $scope.replyTitle = "Reply to " + $scope.message.from.username;
            $scope.replySubject = "RE: " + $scope.message.subject;
            $scope.replyModal.show();
          };
          $scope.closeReply = function () {
            $scope.replyModal.hide();
          };
        });
      };
      $timeout(createModals, 1000);

      //Cleanup the modals when we're done with them
      $scope.$on('$destroy', function () {
        if ($scope.messageModal !== undefined) $scope.messageModal.remove();
        if ($scope.replyModal   !== undefined) $scope.replyModal.remove();
      });

      $scope.replyContent = "";
      $scope.reply = function(subject, content) {
        $scope.disableActions = true;
        KoC.sendMessage($scope.message.from.userid, subject, content)
            .success(function(response){
                if (response.success === true) {
                  $scope.inbox = response.result.inbox;
                  $log.debug("sent the message and refreshed the inbox");
                  $scope.replyModal.hide();
                  $ionicLoading.show({template: 'Message sent', noBackdrop: true, duration: 1000});
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