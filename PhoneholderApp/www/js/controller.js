var controllers = angular.module('controllers', []);

controllers.controller('MainCtrl', function($scope, $state, UserService, $ionicLoading, $ionicModal, $http, $timeout) {

	$scope.token = "";
	$scope.callers = [];
	$scope.incoming_connections = [];
  $scope.current_connection = "";
  $scope.current_connected = false;

	$scope.initialize = function() {
    $scope.get_caller_list();
		$scope.get_token();
	};

  $scope.get_caller_list = function() {
    var request = $http({
      method: "GET",
      url: serverContextPath + '/get_calling_list'
    });
    request.success(function(data) {
      // alert("got list of callers. caller count: " + data.length);
      $scope.callers = data;
      if (!$scope.current_connected) {
        $timeout(function(){ $scope.get_caller_list(); }, 1000);
      }
    });
    request.error(function(error) {
      alert("Error Getting List");
    });
  };

	$scope.get_token = function() {
		var request = $http({
	        method: "GET",
	        url: serverContextPath + '/token?client=fler'
	    });
	    request.success(function(data) {
	    	$scope.token = data;
	    	alert("token: " + data);
	    	$scope.after_get_token();
	    });
	    request.error(function(error) {
	    	alert(error);
	    });
	}

	$scope.call_accept = function (index) {
    // alert("call_accept called. for index: " + index);
    var caller = $scope.callers[index];
    var caller_id = caller['user_id'];
    // alert(caller_id);

    Twilio.Device.connect({"ToClient" : caller_id});
    $scope.openModal();
    document.getElementById('call_modal_title').innerText = "Connecting...";
    // $scope.trackConnection();
	};

	$scope.after_get_token = function() {
	  window.Twilio.Device.setup($scope.token);
    // window.Twilio.Device.sounds.incoming(false);
    // window.Twilio.Device.sounds.outgoing(false);
    // window.Twilio.Device.sounds.disconnect(true);

    window.Twilio.Device.ready(function (device) {
        //alert("Ready");
    });

    window.Twilio.Device.error(function (error) {
        alert("Error: " + error.message);
    });

    window.Twilio.Device.connect(function (conn) {
      //alert("Successfully established call");
      if (typeof(conn) === typeof(window.Twilio.Connection)) {
            // alert("conn object is type of TwilioPlugin.Connection. parameteres are ");

        conn.disconnect(function (connection) {
          //stopConnecting = true;
          alert("Connection disconnected");
          $scope.call_hangup();
        });

        conn.error(function(error) {
          //stopConnecting = true;
          alert("Connection Error: " + error.message);
          $scope.call_hangup();
        });

        $scope.onaccept();
      };
    });

    window.Twilio.Device.disconnect(function (device) {
      alert("Device disconnect.");
    });

    window.Twilio.Device.incoming(function (connection) {
      alert("incoming.");
    });
  }

  $scope.onaccept = function() {
    //alert("Connection accepted");
    $scope.current_connected = true;
    document.getElementById('call_modal_title').innerText = "Connected";
    var request = $http({
      method: "GET",
      url: serverContextPath + '/accept_call/' + caller_id
    });
    request.success(function(data) {
      //alert("accept call succeed");
    });
    request.error(function(error) {
      alert("error" + error);
    });
    document.getElementById('call_modal_title').innerText = "Connected";
  };

  $scope.call_hangup = function() {
    // $scope.closeModal();
    if ($scope.current_connected) {
      Twilio.Connection.disconnect("disconnect");
      $scope.current_connected = false;
    }
    $scope.closeModal();
    $scope.get_caller_list();      
  }

	$scope.find_connection = function(connection) {
		var res = -1;
		var i = 0;
		for (i = 0; i < $scope.incoming_connections.length; i ++) {
      var conn = $scope.incoming_connections[i];
			if (conn === connection) {
				res = i;
				break;
			};
		}
    // alert(res);
		return res;
	}
 
  $scope.trackConnection = function() {
    if ($scope.current_connected) {
      $scope.checkCurrentConnectionStatus();
    } else {
      if ($scope.incoming_connections.length === 1) {
        // alert("checkConnections calling");
        $scope.checkConnections();
      }
    }
  }
  
  $scope.checkConnections = function() {
    if (!$scope.current_connected) {
      // alert("on checkConnections funtion. current length: " + $scope.incoming_connections.length);

      var i = 0;
      for (i = 0; i < $scope.incoming_connections.length; i ++) {
        var conn = $scope.incoming_connections[i];
        conn.status(function(status_string) {
          // alert(status_string);
          if (status_string === "closed") {
            var index = $scope.find_connection(conn);
            if (index >= 0) {
              $scope.callers.splice(index, 1);
              $scope.incoming_connections.splice(index, 1);
            };
          };
        });
      }
      if ($scope.incoming_connections.length >= 1) {
        $timeout(function() {$scope.checkConnections();}, 1000);
      };
    }
  }

  $scope.checkCurrentConnectionStatus = function() {
    if($scope.current_connection) {
      $scope.current_connection.status(function(status_string) {
        // alert(status_string);
        if (status_string === "closed") {
          $scope.current_connected = false;
          $scope.closeModal();

          var index = $scope.find_connection($scope.current_connection);
          if (index >= 0) {
            $scope.callers.splice(index, 1);
            $scope.incoming_connections.splice(index, 1);
            $scope.$apply();
          };

          $scope.checkConnections();
        } else {
          $timeout(function() { $scope.checkCurrentConnectionStatus(); }, 1000);
        }
      });
    }
  }

	$ionicModal.fromTemplateUrl('call-modal.html', {
    	scope: $scope,
    	animation: 'slide-in-up'
  	}).then(function(modal) {
    	$scope.modal = modal;
  	});
  	
  	$scope.openModal = function() {
    	$scope.modal.show();
      document.getElementById('call_modal_title').innerText = "Connected.";
  	};
  	$scope.closeModal = function() {
      if ($scope.modal.isShown()) {
    	 $scope.modal.hide();
      }
  	};
  	// Cleanup the modal when we're done with it!
  	$scope.$on('$destroy', function() {
    	$scope.modal.remove();
  	});
  	// Execute action on hide modal
  	$scope.$on('modal.hidden', function() {
	    // Execute action
  	});
  	// Execute action on remove modal
  	$scope.$on('modal.removed', function() {
		// Execute action
  	});
});