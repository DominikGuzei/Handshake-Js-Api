define(['basic/Class', 'handshake/Communicator'], 
	function(Class, Communicator) {
		
		var Client = Communicator.extend({
			init: function(serverIp, port, gameId) {
				this.superclass(serverIp, port, gameId + "/connect/webclient");
				this.gameId = gameId;

			/**
			 * Register important callbacks for events the Host cares about
			 */
				var self = this;

				this.on("connect", function(event) {
					if(event.sender == "server") {
						// server sends client id
						self.id = event.data;
						self.fire("selfReady", self.id);
					}
				});

				this.on("websocketClose", function(event) {
					self.fire("selfDisconnect", event);
				});

				this.on("exception", function(event) {
					if(event.sender == "server") {
						self.fire("serverException", event);
					} else {
						self.fire("hostException", event);
					}
				});
			},

			sendToHost: function(message, argumentString) {
				this.send("host", message, argumentString);
			}
		});
		
		return Client;
	}
);