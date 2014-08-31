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

  $scope.user = User.get();

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

  $ionicModal.fromTemplateUrl('templates/verify-account.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.verifyAccountModal = modal;
    $scope.openVerifyAccount = function() {
      $scope.verifyAccountModal.show();
    };
    $scope.closeVerifyAccount = function() {
      $scope.loginError = "";
      $scope.verifyAccountModal.hide();
    };
  });

  //Cleanup the modals when we're done with them
  $scope.$on('$destroy', function() {
    if ($scope.forgotLoginModal   !== undefined) $scope.forgotLoginModal.remove();
    if ($scope.verifyAccountModal !== undefined) $scope.verifyAccountModal.remove();
  });

  $scope.openRegister = function() {
    $state.go('register');
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    $ionicLoading.show({
      template: 'Signing-in...'
    });
    User.set($scope.user.username, $scope.user.password);
    User.setLoggedIn(false);

    KoC.login($scope.user.username, $scope.user.password).success(function(response) {
      User.setSession(response.session);
      if (response.success) {
        //User.setBase(response.user);
        User.setLoggedIn(true);
        $state.go('app.base');
      }
      else {
        $scope.loginError = response.error;
        if(response.error.indexOf("verify your account")>=0) {
          $scope.openVerifyAccount();
        }
      }
    }).error(function(err) {
      $scope.loginError = "Error trying to login";
    }).
    finally(function() {
      $ionicLoading.hide();
    });
  };

  $scope.verifyAccount = function() {
    console.log("verifyAccount()");
    $scope.verifyAccountError = "";
    if( $scope.user.email === undefined || !$scope.user.email.length || !User.validateEmail($scope.user.email) )
      $scope.verifyAccountError = "Specify a valid e-mail address";
    else {
      User.setEmail($scope.user.email);
      KoC.validateEmail($scope.user.email).success(function(response) {
        if (response.success) {
          $ionicPopup.alert({
            title: 'E-Mail sent',
            template: response.message,
            okType: "button-dark"
          }).then(function(res) {
            $scope.verifyAccountModal.hide();
          });
        }
        else {
          $scope.verifyAccountError = response.error;
        }
      }).error(function(err) {
        $scope.verifyAccountError = "Error trying to verify your e-mail";
      });
    }
  };

  // Forgot Login
  $scope.forgotLogin = function() {
    if (($scope.user.username === undefined || !$scope.user.username.length) && ($scope.user.email === undefined || !$scope.user.email)) {
      $scope.forgotLoginError = "Specify at least one of them...";
    }
    else {
      $ionicLoading.show({
        template: 'Checking...'
      });
      $scope.forgotLoginError = "";

      // If one of them is blank, set it to "", not undefined
      if ($scope.user.username === undefined) $scope.user.username = "";
      if ($scope.user.email === undefined) $scope.user.email = "";

      // Communicate with KoC
      KoC.forgotLogin($scope.user.username, $scope.user.email).success(function(response) {
        if (response.success) {
          $scope.forgotLoginError = response.message;
          User.setEmail($scope.user.email);
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

  if ($scope.user.loggedIn) {
    // try to login
    $scope.doLogin();
  }

}]);