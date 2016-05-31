angular.module('app.routes', [])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider
    
  

  
      
        
    .state('flerPhone', {
      url: '/',
      templateUrl: 'templates/flerPhone.html'
    })
        
      
    
      
        
    .state('call', {
      url: '/page2',
      templateUrl: 'templates/call.html'
    })
        
      
    
      
        
    .state('news', {
      url: '/page4',
      templateUrl: 'templates/news.html'
    })
        
      
    
      
        
    .state('videos', {
      url: '/page5',
      templateUrl: 'templates/videos.html'
    })



    .state('call_fler', {
      url: '/page6',
      templateUrl: 'templates/call_fler.html'
    })
        
      
    ;

  // if none of the above states are matched, use this as the fallback
  
  $urlRouterProvider.otherwise('/');
  

  

});