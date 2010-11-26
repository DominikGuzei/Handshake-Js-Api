require({ baseUrl: "../../scripts" }, ['handshake/Client'], function(Client) {
	
	var client = undefined;
	var connected = false;
	var currentDirection = 0;

	function connectToHost() {
		if(!connected) {
			var server = document.getElementById("server").value;
			var gameId = document.getElementById("game").value;
			var name = document.getElementById("name").value;
	
			client = new Client("localhost", 8008, gameId);
	
			client.on("selfReady", function(id) {
				console.log("connected to game " + gameId + " with id " + id);
				client.send("host", "clientName", { name: name });
			});
	
			client.on("gameStart", function(event) {
				setupControlListener();
			});
	
			client.connect();
			connected = true;
		}
	}

	var setDirection = function(dir) {
		console.log("direction " + dir);
		client.send("host", "clientDirection", { direction: dir });
		currentDirection = dir;
	}

	var handleIphoneMotion = function(event) {
		var direction = event.accelerationIncludingGravity.y
		setDirection(direction);
	}

	var handleKeyDown = function(event) {
		// handle left key
	  if (event.keyCode == 37 && currentDirection != -1) {
			setDirection(-1);
		}
		// handle right key
		if (event.keyCode == 39 && currentDirection != 1) {	
			setDirection(1);
		}
	}

	var handleKeyUp = function(event) {
		if (event.keyCode == 37 || event.keyCode == 39) {
	      setDirection(0);
	   }
	}

	var setupControlListener = function() {
		// IPHONE ACCELERATOR
		window.ondevicemotion = handleIphoneMotion;
		window.onkeydown = handleKeyDown;
		window.onkeyup = handleKeyUp;
	}
});