angular.module('services', [])

.service('UserService', function() {

  var setUserId = function(user_id){
    window.localStorage.user_id = user_id;
  };

  var getUserId = function(){
    return window.localStorage.user_id;
  }

  return {
    getUserId: getUserId,
    setUserId: setUserId
  };

});