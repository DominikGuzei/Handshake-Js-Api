This Javascript API can be used to facilitate the communication with the Handshake server. It is a small event based messaging API that was designed to take a minimum effort to learn and can be easily used in your own projects. 

How to use
---------
If you learn best by example, you can - There is a full game delivered in the examples folder, where you can simply copy the handshake parts to quickly start building your own games!

### Download and install
Download the source from this website and put it anywhere in your project directory (eg: js, javascripts, ..). Currently you need [require.js](http://requirejs.org/) to include the handshake files into your project. This is very simple though:

**In your .html file:**
		<script type="text/javascript" src="path/to/require.js"></script>
		
**In your .js files where you need the framework:**
as GAME:

		require({ baseUrl: "path/to/handshake" }, ['handshake/Client'], function(Client) {
			client = new Client("193.170.119.85", 8008, gameId);
		}
		
as CONTROLLER (eg. Iphone/Android):
		
		require({ baseUrl: "path/to/handshake" }, ['handshake/Host'], function(Host) {
			gameHost = new Host("193.170.119.85", 8008);
		}

### Connect to Server

**as GAME:**

		require({ baseUrl: "path/to/handshake" }, ['handshake/Client'], function(Client) {
			client = new Client("193.170.119.85", 8008, gameId);
			client.connect();
		}
		
**as CONTROLLER (eg. Iphone/Android):**
		
		require({ baseUrl: "path/to/handshake" }, ['handshake/Host'], function(Host) {
			gameHost = new Host("193.170.119.85", 8008);
			gameHost.connect();
		}

### Send and Receive Messages between game and controllers

**as GAME:**

		require({ baseUrl: "path/to/handshake" }, ['handshake/Client'], function(Client) {
			client = new Client("193.170.119.85", 8008, gameId);
			
			// standard event
			gameHost.on("ready", function(hostId) {
				console.log("game started with id: " + hostId);
			});
			// standard event
			gameHost.on("closed", function(event) {
				console.log("Handshake Server closed connection");
			});>
			// standard event
			gameHost.on("clientConnect", function(client) {
				console.log("client " + client.id + " connected with device: " + client.deviceType);
			});
			// standard event
			gameHost.on("clientDisconnect", function(client) {
				console.log("client " + client.id + " disconnected");
			});

			// CUSTOM EVENT FROM CONTROLLER
			gameHost.on("clientName", function(event) {
				var client = gameHost.getClient(event.sender);

				// save the name for each client
				client.name = event.data.name;
				// do something with this information... eg:
				client.send("gameStart", {});
			});
			
			client.connect();
		}
		
**as CONTROLLER (eg. Iphone/Android):**
		
		require({ baseUrl: "path/to/handshake" }, ['handshake/Host'], function(Host) {
			gameHost = new Host("193.170.119.85", 8008);
			
			// standard event
			client.on("ready", function(id) {
				console.log("connected to game " + gameId + " with id " + id);
				client.send("host", "clientName", { name: name });
			});
			
			// CUSTOM EVENT FROM GAME
			client.on("gameStart", function(event) {
				setupControlListener();
			});
	
			client.connect();
		}

Roadmap
-------
The Handshake project currently uses plain WebSockets to communicate with a ruby server that routes messages between the connected clients. We will probably change to another implementation like Socket.Io + node.js. But for you this won't make any difference, there will only be minimal changes to this API