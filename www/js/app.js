/*global angular, StatusBar, cordova*/

// Ionic Starter App

angular.module('starter.controllers', [])

.run( [ '$rootScope', '$ionicPlatform', '$state', '$stateParams', function($rootScope, $ionicPlatform, $state, $stateParams) {

  // Disable BACK button on base
  $ionicPlatform.registerBackButtonAction(function(event) {
    if ($state.current.name == "app.base") {
      navigator.app.exitApp();
    }
    else if ($state.current.name == "app.help") {
      // go up one level
      $rootScope.$broadcast('kocHelpBack');
    }
    else {
      navigator.app.backHistory();
    }
  }, 100);

}]);

angular.module('starter', ['ionic', 'starter.controllers'])

.run(function($ionicPlatform) {

  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider

  .state('login', {
    url: "/login",
    templateUrl: "templates/login.html",
    controller: 'LoginCtrl'
  })

  .state('register', {
    url: "/register",
    templateUrl: "templates/register.html",
    controller: 'RegisterCtrl'
  })

  .state('logout', {
    url: "/logout",
    templateUrl: "templates/login.html",
    controller: 'LoginCtrl'
  })

  .state('app', {
    url: "/app",
    abstract: true,
    templateUrl: "templates/menu.html",
    controller: 'MainCtrl'
  })

  .state('app.help', {
    url: "/help",
    views: {
      'menuContent': {
        templateUrl: "templates/help.html",
        controller: 'HelpCtrl'
      }
    }
  })

  .state('app.settings', {
    url: "/settings",
    views: {
      'menuContent': {
        templateUrl: "templates/settings.html",
        controller: 'SettingsCtrl'
      }
    }
  })

  .state('app.base', {
    url: "/base",
    views: {
      'menuContent': {
        templateUrl: "templates/base.html",
        controller: 'BaseCtrl'
      }
    }
  })

  .state('app.armory', {
    url: "/armory",
    views: {
      'menuContent': {
        templateUrl: "templates/armory.html",
        controller: 'ArmoryCtrl'
      }
    }
  })

  .state('app.training', {
    url: "/training",
    views: {
      'menuContent': {
        templateUrl: "templates/training.html",
        controller: 'TrainingCtrl'
      }
    }
  })

  .state('app.stats', {
    url: "/stats/:userid",
    views: {
      'menuContent': {
        templateUrl: "templates/stats.html",
        controller: 'StatsCtrl'
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/login');
});