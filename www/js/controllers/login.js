/*global angular,Ionic*/

angular.module('koc.controllers')

  .controller('LoginCtrl', [ "$ionicPlatform", "$scope", "$timeout", "$state", "$ionicLoading", "$ionicModal", "$ionicPopup", '$log', "User", "KoC", "IonicUpdate",
    function ($ionicPlatform, $scope, $timeout, $state, $ionicLoading, $ionicModal, $ionicPopup, $log, User, KoC, IonicUpdate) {

      $log.debug("LoginCtrl");

      // If we're not on a device, don't auto-login on Android
      // Otherwise Ionic Lab logins at the same time on Android AND iOS
      var isCordovaApp = !!window.cordova;
      var autoLoad = isCordovaApp || ionic.Platform.platform()=="ios";

      if ($state.current.name == "logout") {
        User.setLoggedIn(false);
        // Logout
        KoC.logout().success(function (response) {
          if (response.success === true) {
            $ionicLoading.show({template: 'Logged out', noBackdrop: true, duration: 1000});
          }
          else {
            $scope.loginError = response.error;
          }
        }).error(function (error) {
          $scope.loginError = "Error trying to logout...";
					$log.error("Error signing out: ", error);
        });
      }

      $scope.user = User.get();

      $scope.logoUrl = KoC.getLogoUrl();

      $scope.age = User.getAge();
      var getKoCAge = function () {
        KoC.getPage("GET", "/index", {}, 60 * 60, false)
          .success(function (res) {
            if (res !== undefined && res !== null && res.age !== undefined)
              $scope.age = res.age;
          })
          .error(function (err) {
            $log.debug("Error retrieving index: ", err);
          });
      };
      if(autoLoad)
        getKoCAge();

      var createModals = function () {

        $ionicModal.fromTemplateUrl('templates/forgot-login.html', {
          scope: $scope,
          animation: 'slide-in-up'
        }).then(function (modal) {
          $scope.forgotLoginModal = modal;
          $scope.openForgotLogin = function () {
            $scope.forgotLoginModal.show();
          };
          $scope.closeForgotLogin = function () {
            $scope.forgotLoginModal.hide();
          };
        });

        $ionicModal.fromTemplateUrl('templates/verify-account.html', {
          scope: $scope,
          animation: 'slide-in-up'
        }).then(function (modal) {
          $scope.verifyAccountModal = modal;
          $scope.openVerifyAccount = function () {
            $scope.verifyAccountModal.show();
          };
          $scope.closeVerifyAccount = function () {
            $scope.loginError = "";
            $scope.verifyAccountModal.hide();
          };
        });
      };

      //Cleanup the modals when we're done with them
      $scope.$on('$destroy', function () {
        if ($scope.forgotLoginModal !== undefined) $scope.forgotLoginModal.remove();
        if ($scope.verifyAccountModal !== undefined) $scope.verifyAccountModal.remove();
      });

      $scope.openRegister = function () {
        //$state.go('register');
        window.open('http://www.kingsofchaos.com', '_system', 'location=yes');
        return false;
      };

      // Perform the login action when the user submits the login form
      $scope.doLogin = function () {
        $ionicLoading.show({
          template: 'Signing-in...'
        });
        User.set($scope.user.username, $scope.user.password);
        User.setLoggedIn(false);

        KoC.login($scope.user.username, $scope.user.password).success(function (response) {
          if(response===undefined) {
            $scope.loginError = "Run the API locally";
          }
          else {
            User.setSession(response.session);
            if (response.success) {
              $scope.loginError = "";
              //User.setBase(response.user);
              User.setLoggedIn(true);
							$state.go('app.base');
            }
            else {
              $scope.loginError = response.error;
              if (response.error.indexOf("verify your account") >= 0) {
                $scope.openVerifyAccount();
              }
            }
          }
        }).error(function (err) {
          $log.error(err);
          $scope.loginError = "Error trying to login";
        }).
          finally(function () {
            $ionicLoading.hide();
          });
      };

      $scope.verifyAccount = function () {
        $log.debug("verifyAccount()");
        $scope.verifyAccountError = "";
        if ($scope.user.email === undefined || !$scope.user.email.length || !User.validateEmail($scope.user.email))
          $scope.verifyAccountError = "Specify a valid e-mail address";
        else {
          User.setEmail($scope.user.email);
          KoC.verifyEmail($scope.user.email).success(function (response) {
            if (response.success) {
              $ionicPopup.alert({
                title: 'E-Mail sent',
                template: response.result.message,
                okType: "button-dark"
              }).then(function () {
                $scope.closeVerifyAccount();
              });
            }
            else {
              $scope.verifyAccountError = response.error;
            }
          }).error(function (err) {
            $scope.verifyAccountError = "Error trying to verify your e-mail";
						$log.error("Error trying to verify e-mail:", err);
          });
        }
      };

      // Forgot Login
      $scope.forgotLogin = function () {
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
          KoC.forgotLogin($scope.user.username, $scope.user.email).success(function (response) {
            if (response.success) {
              $scope.forgotLoginError = response.result.message;
              User.setEmail($scope.user.email);
              $ionicPopup.alert({
                title: 'Credentials sent',
                template: response.result.message,
                okType: "button-dark"
              }).then(function () {
                $scope.forgotLoginModal.hide();
              });
            }
            else $scope.forgotLoginError = response.error;
          }).error(function (error) {
            $scope.forgotLoginError = "An error occurred";
          }).
            finally(function () {
              $ionicLoading.hide();
            });
        }
      };

			$scope.$on('$ionicView.enter', function(){

				try {
					Ionic.io();
					$log.debug("Ionic.io() initialized");
				} catch(e){
					$log.error("An error occurred initializing Ionic.io():", e);
				}

				// Update the app
				IonicUpdate.updateIfNewerVersion();

				$timeout(createModals, 1000);
				if ($scope.user.loggedIn) {
					// try to login when ionic is ready
					$ionicPlatform.ready(function () {
						$scope.doLogin();
					} );
				}
			});

			User.cleanupOldCache();

    }]);
