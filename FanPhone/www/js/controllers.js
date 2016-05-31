var controllers = angular.module('app.controllers', []); 
var audioElement = undefined;
  
controllers.controller('flerPhoneCtrl', function($scope) {

})
   
.controller('callCtrl', function($scope) {

})
   
.controller('newsCtrl', function($scope) {

})
   
.controller('videosCtrl', function($scope) {

})

.controller('callFlerCtrl', function($scope, $state,$q, UserService, $ionicLoading, $ionicModal, $http, $timeout) {

	$scope.token = "";
	$scope.current_status = 0;
	$scope.puchased = 0;
	$scope.connected = false;
	$scope.calling = false;

	$scope.initialize = function() {
		$scope.get_user_id();
	}

	$scope.get_user_id = function() {
		$scope.user_id = UserService.getUserId();

		if ($scope.user_id === undefined || $scope.user_id === "") {
			var request = $http({
	        	method: "GET",
	        	url: serverContextPath + "/user_id"
	    	});

	    	request.success(function(data) {
	    		UserService.setUserId(data['user_id']);
	    		$scope.user_id = data['user_id'];
	    		$scope.current_status = data['current_status'];
	    		$scope.purchased = data['purchased'];
	    		alert("New user_id: " + data['user_id']);

	    		$scope.get_token();
	    	});
	    	request.error(function(error) {
	    		alert("Error in requesting data.");
	    	});
		} else {
			var request = $http({
				method: "GET",
				url: serverContextPath + "/user_id/" + $scope.user_id
			});

			request.success(function(data) {
				$scope.current_status = data['current_status'];
				$scope.purchased = data['purchased'];
				// alert("purchased: " + $scope.purchased);

				$scope.get_token();
			});
			request.error(function(error) {
				alert("Error in analyzing data.");
			});
		}
	};

	$scope.get_token = function() {
		alert($scope.user_id);
		var request = $http({
	        method: "GET",
	        url: serverContextPath + '/token?client=' + $scope.user_id
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

	
	$scope.after_get_token = function() {

		Twilio.Device.setup($scope.token);
		// Twilio.Device.sounds.incoming(false);
		// Twilio.Device.outgoing(false);
		// Twilio.Device.sounds.disconnect(true);

		// Twilio device callback functions
        Twilio.Device.error(function (error) {
            alert("Device Error: " + error.message);
        });

		Twilio.Device.offline(function (error) {
            // alert("Device Offline");
        });

        Twilio.Device.ready(function (device) {
            alert("Device Ready");
        });

        Twilio.Device.presence(function (presence) {
        	if (presence.from === "fler") {
        		// alert("Fler is online.");
        	};
        });

        Twilio.Device.disconnect(function (device) {
      		alert("Device disconnect.");
    	});

        Twilio.Device.incoming(function (conn) {
        	//alert("incoming call.");
        	if (typeof(conn) === typeof(window.Twilio.Connection)) {
        		//alert("voice call started.");

        		conn.accept();
        		$scope.calling = false;
        		$scope.connected = true;
        		audioElement.pause();
        		document.getElementById('call_modal_title').innerText = "Connected";

        		// start tracking
        		// get status
        		$scope.checkStatus();
        	}
        });
	};

	$scope.call = function ($event) {
		// if ($scope.purchased) {
			if ($scope.token === undefined || $scope.token === "") {
				alert("Token is empty.");
			} else {
				var request = $http({
			        method: "GET",
			        url: serverContextPath + '/start_call/' + $scope.user_id
			    });
			    request.success(function(data) {
			    	if (data['error_code'] !== 0) {
			    		alert("Error in starting call.");
			    	} else {
			    		// alert("Call started");
			    		$scope.calling = true;
			    		// after call started
			    		// play music.
			    		if (audioElement === undefined) {
			    			audioElement = document.createElement('audio');
	        				audioElement.src = 'audio/ring.mp3';
	        				audioElement.loop = true;
			    		}
	        			audioElement.currentTime = 0;
	        			audioElement.play();

			    		// dials timer, after timeout close dialog
			    		$timeout(function() {
			    			if ($scope.calling) {
			    				$scope.call_hangup();
			    			}
			    		}, 30000);

			    		$scope.openModal();
			    		document.getElementById('call_modal_title').innerText = "Connecting...";
			    	}
			    });
			    request.error(function(error) {
			    	alert("Error in requesting call start");
			    });
			}
		// } else {
		//}
	};

	$scope.call_hangup = function() {
		if ($scope.connected) {
			Twilio.Connection.disconnect();
			$scope.connected = false;
		};
		if ($scope.calling) {
			$scope.calling = false;	
		};
		audioElement.pause();
		
		var request = $http({
	        method: "GET",
	        url: serverContextPath + '/hang_up_call/' + $scope.user_id
	    });
	    request.success(function(data) {
	    	if (data['error_code'] !== 0) {
	    		alert("Error in hanging up call.");
	    	} else {
	    		// alert("Succeed in hanging up call.");
	    	}
	    });
	    request.error(function(error) {
	    	alert("Error in Requesting hanging up the call.");
	    });
		$scope.closeModal();
	};

	$ionicModal.fromTemplateUrl('call-modal.html', {
    	scope: $scope,
    	animation: 'slide-in-up'
  	}).then(function(modal) {
    	$scope.modal = modal;
  	});	
  	
  	$scope.openModal = function() {
    	$scope.modal.show();
    	document.getElementById('call_modal_title').innerText = "Connecting...";
  	};
  	$scope.closeModal = function() {
  		if ($scope.modal.isShown()) {
    		$scope.modal.hide();
    	}
  	};

  	$scope.checkStatus = function() {
  		//alert("checkStatus called.");
		if ($scope.connected) {
			// alert("checkStatus called. ---");
			window.Twilio.Connection.status(function(status_string) {
				// alert(status_string);
				if (status_string === "closed") {
					$scope.call_hangup();
				} else {
					$timeout(function() { $scope.checkStatus(); }, 1000);
				}
			});
		};
	}
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