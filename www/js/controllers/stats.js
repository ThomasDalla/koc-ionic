/*global angular*/

angular.module('starter.controllers')

.controller('StatsCtrl', ['$scope', '$stateParams', '$state', '$ionicLoading', '$ionicViewService', '$rootScope', '$ionicPopup', 'User', 'KoC',

function($scope, $stateParams, $state, $ionicLoading, $ionicViewService, $rootScope, $ionicPopup, User, KoC) {

  console.log("StatsCtrl");
  $scope.statsError = "Loading...";
  //$cordovaToast.show('Here is a message', 'long', 'center');
  //$ionicLoading.show({ template: 'MEssage', noBackdrop: true, duration: 2000 });

  var userid = $stateParams.userid;
  $scope.nbTimesCanChangeCommander = $rootScope.nbTimesCanChangeCommander || 0;
  $scope.canChangeCommander = !! $rootScope.canChangeCommander;

  $scope.showUserStats = function(userid) {
    if (isFinite(userid) && userid > 0) $state.go('app.stats', {
      userid: userid
    });
  };

  $scope.backView = $ionicViewService.getBackView();
  $scope.goBack = function() {
    //console.log("backview: ", $scope.backView);
    $scope.backView && $scope.backView.go();
  };

  $scope.alliancesList = function(alliances) {
    if (alliances === undefined || alliances === null || !alliances.length) return "None";
    return alliances.map(function(alliance) {
      return alliance.name + (alliance.primary ? " (Primary)" : "");
    }).join(", ");
  };

  $scope.reloadStats = function(cacheTimeInSeconds) {
    console.log("load the stats, cacheTimeInSeconds=" + cacheTimeInSeconds);
    $scope.statsError = "";
    KoC.getUserStats(userid, cacheTimeInSeconds).success(function(response) {
      if (response.success === true) {
        //User.setBase(response.user);
        //console.log("$scope.userStats", response.user);
        $scope.userStats = response.user;
        $scope.stats = response.stats;
        //$rootScope.$broadcast('kocAdvisor', response.help);
        console.log("retrieved the stats");
        // $ionicLoading.show({
        //   template: 'Retrieved user stats',
        //   noBackdrop: true,
        //   duration: 1000
        // });
      }
      else {
        $scope.statsError = response.error;
      }
    }).error(function(error) {
      //$ionicLoading.hide();
      $scope.statsError = "An error occurred retrieving the stats";
    }).
    finally(function() {
      console.log("finally");
      //$ionicLoading.hide();
      // Stop the ion-refresher from spinning
      $scope.$broadcast('scroll.refreshComplete');
    });
  };

  // If valid base retrieved less than 5 minutes ago, re-use it
  var cacheTimeInSeconds = 60 * 5;
  $scope.userStats = User.getCache("/stats/" + userid, - 1); // by default when opening, get it from the cache
  $scope.reloadStats(cacheTimeInSeconds); // but also reload if older than 5 minutes

  $scope.changeCommander = function() {
    // confirm first
    $ionicPopup.confirm({
      title: 'Change Commander?',
      template: 'You can change your commander only '+$scope.nbTimesCanChangeCommander+' more times.<br>Are you sure you want to make '+ $scope.userStats.username +' your commander now?'
    }).then(function(res) {
      if (res) {
        // change commander
        KoC.changeCommander(userid).success(function(response){
          if(response.success){
            $ionicLoading.show({ template: $scope.userStats.username + ' is now your commander!', noBackdrop: true, duration: 2000 });
          } else {
            $ionicLoading.show({ template: response.error, noBackdrop: true, duration: 2000 });
          }
        }).error(function(){
          $ionicLoading.show({ template: 'An error occurred changing commander', noBackdrop: true, duration: 2000 });
        });
      }
      else {
        $ionicLoading.show({ template: 'Commander NOT Changed', noBackdrop: true, duration: 1000 });
      }
    });
  };

}]);