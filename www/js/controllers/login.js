/*global angular*/

angular.module('starter.controllers')

.controller('LoginCtrl', ["$scope", "$timeout", "$state", "$ionicViewService", "$ionicLoading", "$ionicModal", "$ionicPopup", "User", "KoC",
     function($scope, $timeout, $state, $ionicViewService, $ionicLoading, $ionicModal, $ionicPopup, User, KoC) {

  console.log("LoginCtrl");

  if ($state.current.name == "logout") {
    User.setLoggedIn(false);
    // Logout
    KoC.logout().success(function(response){
      if(response.success===true){
        $ionicLoading.show({ template: 'Logged out', noBackdrop: true, duration: 1000 });
      }
      else {
        $scope.loginError = response.error;
      }
    }).error(function(error){
      $scope.loginError = "Error trying to logout...";
    });
  }

  var user = User.get();

  // Form data for the login modal
  $scope.loginData = {
    username: user.username,
    password: user.password
  };

  $scope.age = 17;

  $ionicModal.fromTemplateUrl('templates/forgot-login.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.forgotLoginModal = modal;
    $scope.openForgotLogin = function() {
      $scope.forgotLoginModal.show();
    };
    $scope.closeForgotLogin = function() {
      $scope.forgotLoginModal.hide();
    };
  });

  //Cleanup the modals when we're done with them
  $scope.$on('$destroy', function() {
    if ($scope.forgotLoginModal !== undefined) $scope.forgotLoginModal.remove();
  });

  $scope.openRegister = function() {
    $state.go('register');
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    $ionicLoading.show({
      template: 'Signing-in...'
    });
    User.set($scope.loginData.username, $scope.loginData.password);
    User.setLoggedIn(false);

    KoC.login($scope.loginData.username, $scope.loginData.password).success(function(response) {
      User.setSession(response.session);
      if (response.success) {
        //User.setBase(response.user);
        User.setLoggedIn(true);
        $state.go('app.base');
      }
      else {
        $scope.loginError = response.error;
      }
    }).error(function(err) {
      $scope.loginError = "Error trying to login";
    }).
    finally(function() {
      $ionicLoading.hide();
    });
  };

  // Forgot Login
  $scope.forgotLogin = function() {
    if (($scope.loginData.username === undefined || !$scope.loginData.username.length) && ($scope.loginData.email === undefined || !$scope.loginData.email)) {
      $scope.forgotLoginError = "Specify at least one of them...";
    }
    else {
      $ionicLoading.show({
        template: 'Checking...'
      });
      $scope.forgotLoginError = "";

      // If one of them is blank, set it to "", not undefined
      if ($scope.loginData.username === undefined) $scope.loginData.username = "";
      if ($scope.loginData.email === undefined) $scope.loginData.email = "";

      // Communicate with KoC
      KoC.forgotLogin($scope.loginData.username, $scope.loginData.email).success(function(response) {
        if (response.success) {
          $scope.forgotLoginError = response.message;
          $ionicPopup.alert({
            title: 'Credentials sent',
            template: response.message,
            okType: "button-dark"
          }).then(function(res) {
            $scope.forgotLoginModal.hide();
          });
        }
        else $scope.forgotLoginError = response.error;
      }).error(function(error) {
        $scope.forgotLoginError = "An error occurred";
      }).
      finally(function() {
        $ionicLoading.hide();
      });
    }
  };

  if (user.loggedIn) {
    // try to login
    $scope.doLogin();
  }

}]);