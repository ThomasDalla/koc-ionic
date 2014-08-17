/*global angular*/

angular.module('starter.controllers')

.controller('MainCtrl', function($scope, $ionicModal, $timeout, $state, $ionicPopup, User) {

  console.log("MainCtrl");
  User.getCache( "stats", -1 ).then(function(stats){
    $scope.stats = stats;
  });
  $scope.showAdvisor = User.showAdvisor();

  $scope.$on('kocStats', function(event, stats) {
    console.log("MainCtrl received kocStats");
    if(stats.username=="???")
      stats.username = $scope.stats !== undefined ? ( $scope.stats.username || "Menu" ) : "Menu";
    $scope.stats = stats;
  });
  $scope.$on('kocAdvisor', function(event, help) {
    console.log("MainCtrl received kocAdvisor");
    if(help===undefined||help===null)
      help = "";
    $scope.advisor = help;
  });
  $scope.$on('kocShowAdvisor', function(event, showAdvisor) {
    console.log("MainCtrl received kocShowAdvisor:", showAdvisor);
    $scope.showAdvisor = showAdvisor;
  });

  $scope.showAdvisorHelp = function() {
    if($scope.advisor.length) {
          $ionicPopup.alert({
            title: 'Help',
            template: $scope.advisor,
            okType: "button-dark"
          }).then(function(res) {
          });
    }
  };

});