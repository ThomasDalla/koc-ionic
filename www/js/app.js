/*global angular, StatusBar, cordova*/

// Ionic KoC App
angular.module('koc.controllers', [ 'ngCordova', 'koc.services' ])

  .run(['$rootScope', '$ionicPlatform', '$state', 'Config', function ($rootScope, $ionicPlatform, $state, Config) {

    // Cache remote config at startup
    Config.getConfig();

    // Disable BACK button on base
    $ionicPlatform.registerBackButtonAction(function () {
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

angular.module('koc', ['ionic','ionic.service.core', 'ionic.service.analytics', 'koc.controllers'])

  .run([ '$ionicPlatform', '$ionicAnalytics', '$ionicLoading', '$log', function ($ionicPlatform, $ionicAnalytics, $ionicLoading, $log) {

    $log.debug("Starting app...");
    $ionicPlatform.ready(function () {
      $log.debug("Ionic platform ready");
			$ionicAnalytics.register();
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
  } ] )

  .config(['$stateProvider', '$urlRouterProvider', '$ionicConfigProvider', '$logProvider', '$ionicAppProvider',
    function ($stateProvider, $urlRouterProvider, $ionicConfigProvider, $logProvider, $ionicAppProvider) {

      // Identify app
      $ionicAppProvider.identify({
        // The App ID for the server
        app_id: 'a3ef2052',
        // The API key all services will use for this app
        api_key: 'b9deb2aa624107710c3b513cc77fda6e20bb77af46741a33'
      });

      var isCordovaApp = !!window.cordova;
      $logProvider.debugEnabled(!isCordovaApp);

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

        .state('app.about', {
          url: "/about",
          views: {
            'menuContent': {
              templateUrl: "templates/about.html",
              controller: 'AboutCtrl'
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
          abstract: true,
          views: {
            'menuContent': {
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

        .state('app.battlefield', {
          url: "/battlefield/:page?",
          views: {
            'menuContent': {
              templateUrl: "templates/battlefield.html",
              controller: 'BattlefieldCtrl'
            }
          },
        })

        .state('app.attacklog', {
          url: "/attacklog",
          abstract: true,
          views: {
            'menuContent': {
              templateUrl: "templates/attacklog.html",
              controller: 'AttackLogCtrl',
            }
          }
        })
        .state('app.attacklog.byYou', {
          url: '/byYou',
          views: {
            'attacklogByYou': {
              templateUrl: 'templates/attacklog.byYou.html',
            }
          }
        })
        .state('app.attacklog.onYou', {
          url: '/onYou',
          views: {
            'attacklogOnYou': {
              templateUrl: 'templates/attacklog.onYou.html',
            },
          }
        })

        .state('app.intel', {
          url: "/intel",
          abstract: true,
          views: {
            'menuContent': {
              templateUrl: "templates/intel.html",
              controller: 'IntelCtrl',
            }
          }
        })
        .state('app.intel.intercepted', {
          url: '/intercepted',
          views: {
            'intelIntercepted': {
              templateUrl: 'templates/intel.intercepted.html',
            }
          }
        })
        .state('app.intel.files', {
          url: '/files',
          views: {
            'intelFiles': {
              templateUrl: 'templates/intel.files.html',
            },
          }
        })

        .state('app.battlereport', {
          url: '/battlereport/:attack_id/:userid?',
          views: {
            'menuContent': {
              templateUrl: 'templates/battlereport.html',
              controller: 'BattleReportCtrl',
            }
          }
        })

        .state('app.intelfile', {
          url: "/intelfile/:asset_id",
          views: {
            'menuContent': {
              templateUrl: "templates/intelfile.html",
              controller: 'IntelFileCtrl',
            }
          }
        })

        .state('app.inteldetail', {
          url: "/inteldetail/:report_id/:userid?",
          views: {
            'menuContent': {
              templateUrl: "templates/inteldetail.html",
              controller: 'IntelDetailCtrl',
            }
          }
        })

        .state('app.inbox', {
          url: "/inbox",
          views: {
            'menuContent': {
              templateUrl: "templates/inbox.html",
              controller: 'InboxCtrl'
            }
          }
        })

      ;

      // if none of the above states are matched, use this as the fallback
      $urlRouterProvider.otherwise('/login');
    }]);
