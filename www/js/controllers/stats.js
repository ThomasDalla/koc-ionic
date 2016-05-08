/*global angular*/

angular.module('koc.controllers')

  .controller('StatsCtrl', ['$scope', '$stateParams', '$state', '$ionicLoading', '$ionicHistory', '$ionicModal', '$timeout', '$rootScope', '$ionicPopup', '$log', 'User', 'KoC',
    function ($scope, $stateParams, $state, $ionicLoading, $ionicHistory, $ionicModal, $timeout, $rootScope, $ionicPopup, $log, User, KoC) {

      $log.debug("StatsCtrl");
      $scope.statsError = "Loading...";
      $scope.userStats = { username: "User Stats" };
      $scope.disableActions = false;

      var userid = $stateParams.userid;
      $scope.nbTimesCanChangeCommander = $rootScope.nbTimesCanChangeCommander || 0;
      $scope.canChangeCommander = !!$rootScope.canChangeCommander;

      $scope.showUserStats = function (userid) {
        if (isFinite(userid) && userid > 0) $state.go('app.stats', {
          userid: userid,
        });
      };

      $scope.alliancesList = function (alliances) {
        if (alliances === undefined || alliances === null || !alliances.length) return "None";
        return alliances.map(function (alliance) {
          return alliance.name + (alliance.primary ? " (Primary)" : "");
        }).join(", ");
      };

      $scope.reloadStats = function (cacheTimeInSeconds) {
        $log.debug("load the stats, cacheTimeInSeconds=" + cacheTimeInSeconds);
        $scope.statsError = "";
        KoC.getUserStats(userid, cacheTimeInSeconds).success(function (response) {
          if (response.success === true) {
            //User.setBase(response.user);
            //$log.debug("$scope.userStats", response.user);
            $scope.userStats = response.result.user;
            $scope.turing = response.turing;
            $scope.stats = response.stats;
            $rootScope.$broadcast('kocAdvisor', response.help);
            $log.debug("retrieved the stats");
            // $ionicLoading.show({
            //   template: 'Retrieved user stats',
            //   noBackdrop: true,
            //   duration: 1000
            // });
          }
          else {
            $scope.statsError = response.error + " (inactive user?)";
          }
        }).error(function (error) {
          //$ionicLoading.hide();
          $scope.statsError = "An error occurred retrieving the stats";
        }).
          finally(function () {
            $log.debug("finally");
            //$ionicLoading.hide();
            // Stop the ion-refresher from spinning
            $scope.$broadcast('scroll.refreshComplete');
          });
      };

      $scope.$on('$ionicView.enter', function(){
        var cache = User.getCache("/stats/" + userid, -1); // by default when opening, get it from the cache
        if(cache!==null)
          $scope.userStats = cache;
        var cacheTimeInSeconds = 60;
        $scope.reloadStats(cacheTimeInSeconds); // but also reload from cache if too old
      });

      $scope.changeCommander = function () {
        // confirm first
        var confirmPopup = $ionicPopup.confirm({
          title: 'Change Commander?',
          template: 'You can change your commander only ' + $scope.nbTimesCanChangeCommander + ' more times.<br>Are you sure you want to make ' + $scope.userStats.username + ' your commander now?',
          scope: $scope,
          okType: "button-dark",
        });
        confirmPopup.then(function (res) {
          if (res) {
            // change commander
            KoC.changeCommander(userid).success(function (response) {
              if (response.success) {
                $ionicLoading.show({
                  template: $scope.userStats.username + ' is now your commander!',
                  noBackdrop: true,
                  duration: 2000
                });
              } else {
                $ionicLoading.show({template: response.error, noBackdrop: true, duration: 2000});
              }
            }).error(function () {
              $ionicLoading.show({template: 'An error occurred changing commander', noBackdrop: true, duration: 2000});
            });
          }
          else {
            $ionicLoading.show({template: 'Commander NOT Changed', noBackdrop: true, duration: 1000});
          }
        });
      };

      $scope.reconButtonText = "Recon";
      $scope.recon = function(){
        if(!$scope.disableActions){
          $scope.reconButtonText = "Spying...";
          $scope.disableActions = true;
          $log.debug('Spying from stats.js...');
          KoC.recon(userid, $scope.turing).success(function (response) {
            if (response.success
              && response.result !== undefined
              && response.result.reportId !== undefined
              && isFinite(response.result.reportId)
              && response.result.reportId > 0 ) {
              $log.debug('moving from stats to inteldetail...');
              $state.go('app.inteldetail', {
                report_id: response.result.reportId,
                userid: userid,
              });
            } else {
              $log.debug(response);
              $ionicLoading.show({template: "Error: " + response.error, noBackdrop: true, duration: 2000});
              $scope.reconButtonText = "Recon";
            }
          }).error(function () {
            $ionicLoading.show({template: 'An error occurred spying the enemy', noBackdrop: true, duration: 2000});
          }).finally(function(){
            $scope.disableActions = false;
            $scope.reconButtonText = "Recon";
          });
        }
      };

      $scope.attackButtonText = "Attack";
      $scope.attack = function() {
        if(!$scope.disableActions){
          $scope.attackButtonText = "Attacking...";
          $scope.disableActions = true;
          $log.debug('Attacking from stats.js...');
          KoC.attack(userid, $scope.turing).success(function (response) {
            if (response.success
              && response.result !== undefined
              && response.result.attackId !== undefined
              && isFinite(response.result.attackId)
              && response.result.attackId > 0 ) {
              $log.debug('moving from stats to battlereport...');
              $state.go('app.battlereport', {
                attack_id: response.result.attackId,
                userid: userid,
              });
            } else {
              $log.debug(response);
              $ionicLoading.show({template: "Error: " + response.error, noBackdrop: true, duration: 2000});
            }
          }).error(function () {
            $ionicLoading.show({template: 'An error occurred attacking the enemy', noBackdrop: true, duration: 2000});
          }).finally(function(){
            $scope.disableActions = false;
            $scope.attackButtonText = "Attack";
          });
        }
      };

      $scope.raidButtonText = "Raid";
      $scope.raid = function() {
        if(!$scope.disableActions){
          $scope.raidButtonText = "Attacking...";
          $scope.disableActions = true;
          $log.debug('Raiding from stats.js...');
          KoC.raid(userid, $scope.turing).success(function (response) {
            if (response.success
              && response.result !== undefined
              && response.result.attackId !== undefined
              && isFinite(response.result.attackId)
              && response.result.attackId > 0 ) {
              $log.debug('moving from stats to battlereport...');
              $state.go('app.battlereport', {
                attack_id: response.result.attackId,
                userid: userid,
              });
            } else {
              $log.debug(response);
              $ionicLoading.show({template: "Error: " + response.error, noBackdrop: true, duration: 2000});
            }
          }).error(function () {
            $ionicLoading.show({template: 'An error occurred attacking the enemy', noBackdrop: true, duration: 2000});
          }).finally(function(){
            $scope.disableActions = false;
            $scope.raidButtonText = "Raid";
          });
        }
      };

      // Send message from Stats
      $scope.replyModal = null;
      var createModals = function () {
        $ionicModal.fromTemplateUrl('templates/reply.html', {
          scope: $scope,
          animation: 'slide-in-up'
        }).then(function (modal) {
          $scope.replyModal = modal;
          $scope.sendMessage = function () {
            $scope.replyTitle = "Message to " + $scope.userStats.username;
            $scope.replySubject = "";
            $scope.replyContent = "";
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
        if ($scope.replyModal   !== undefined) $scope.replyModal.remove();
      });

      $scope.replyContent = "";
      $scope.reply = function(subject, content) {
        $scope.disableActions = true;
        KoC.sendMessage(userid, subject, content)
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

    }]);