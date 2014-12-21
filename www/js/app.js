/*global angular, StatusBar, cordova*/

// Ionic KoC App
angular.module('koc.controllers', [ 'koc.services' ])

  .run(['$rootScope', '$ionicPlatform', '$state', function ($rootScope, $ionicPlatform, $state) {

    // Disable BACK button on base
    $ionicPlatform.registerBackButtonAction(function (event) {
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

angular.module('koc', ['ionic', 'koc.controllers'])

  .run(function ($ionicPlatform) {

    $ionicPlatform.ready(function () {
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

  .config(['$stateProvider', '$urlRouterProvider', '$ionicConfigProvider', '$logProvider',
    function ($stateProvider, $urlRouterProvider, $ionicConfigProvider, $logProvider) {

      $logProvider.debugEnabled(false);

      $ionicConfigProvider.tabs.style('striped');
      $ionicConfigProvider.tabs.position('bottom');

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
              abstract: true,
              templateUrl: "templates/armory.html",
              controller: 'ArmoryCtrl'
            }
          }
        })
        .state('app.armory.buy', {
          url: '/buy',
          views: {
            'armoryBuyTab': {
              templateUrl: 'templates/armory.buy.html',
              //controller: 'ArmoryCtrl',
            }
          }
        })
        .state('app.armory.current', {
          url: '/current',
          views: {
            'armoryCurrentTab': {
              templateUrl: 'templates/armory.current.html',
              //controller: 'ArmoryCtrl',
            },
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

        .state('app.mercenaries', {
          url: "/mercenaries",
          views: {
            'menuContent': {
              templateUrl: "templates/mercenaries.html",
              controller: 'MercenariesCtrl'
            }
          }
        })

        .state('app.recruit', {
          url: "/recruit",
          views: {
            'menuContent': {
              templateUrl: "templates/recruit.html",
              controller: 'RecruitCtrl'
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
        })

        .state('app.battefield', {
          url: "/battlefield/:page",
          views: {
            'menuContent': {
              templateUrl: "templates/battlefield.html",
              controller: 'BattlefieldCtrl'
            }
          },
        });

      // if none of the above states are matched, use this as the fallback
      $urlRouterProvider.otherwise('/login');
    }]);