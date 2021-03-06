// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', [
  'firebase',
  'ionic', 
  'starter.controllers', 
  'starter.services',
  'ngCordova',
  'common.fabric',
  'common.fabric.utilities',
  'common.fabric.constants',
  'ionic.contrib.ui.tinderCards',
  // 'ionic-color-picker',
])

.constant('FBURL', 'https://versy.firebaseio.com')

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleLightContent();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
    .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html'
  })

  // Each tab has its own nav history stack:

  .state('tab.create', {
    url: '/create',
    views: {
      'tab-create': {
        templateUrl: 'templates/tab-create.html',
        controller: 'CreateCtrl',
        resolve: {
            currentAuth: function(Auth) {
              return Auth.$waitForAuth();
            },
          },
      }
    }
  })

  .state('tab.create2', {
    url: '/create',
    views: {
      'tab-create': {
        templateUrl: 'templates/tab-create2.html',
        controller: 'Create2Ctrl',
        resolve: {
          currentAuth: function(Auth) {
            return Auth.$waitForAuth();
          },
        },
      }
    }
  })

  .state('tab.create3', {
    url: '/create',
    views: {
      'tab-create': {
        templateUrl: 'templates/tab-create3.html',
        controller: 'Create3Ctrl',
        resolve: {
          currentAuth: function(Auth) {
            return Auth.$waitForAuth();
          },
        },
      }
    }
  })

  .state('tab.detail', {
    url: '/detail/:id',
    views: {
      'tab-timeline': {
        templateUrl: 'templates/tab-detail.html',
        controller: 'DetailCtrl',
        resolve: {
          currentAuth: function(Auth) {
            return Auth.$waitForAuth();
          }
        }
      }
    }
  })

  .state('tab.browse', {
      url: '/browse',
      views: {
        'tab-browse': {
          templateUrl: 'templates/tab-browse.html',
          controller: 'BrowseCtrl',
          resolve: {
            currentAuth: function(Auth) {
              return Auth.$waitForAuth();
            },
          },
        }
      }
    })
    .state('tab.timeline', {
      url: '/timeline',
      views: {
        'tab-timeline': {
          templateUrl: 'templates/tab-timeline.html',
          controller: 'TimelineCtrl',
          resolve: {
            currentAuth: function(Auth) {
              return Auth.$waitForAuth();
            },
          },
        }
      }
    })
  
  .state('login', {
    url: "/login",
    templateUrl: "templates/login.html",
    controller: 'LoginCtrl'
  })

  .state('tab.group', {
    url: '/group',
    views: {
      'tab-group': {
        templateUrl: 'templates/tab-group.html',
        controller: 'GroupCtrl'
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/timeline');

});
