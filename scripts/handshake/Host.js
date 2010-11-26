define(['basic/Class', 'handshake/Communicator'], 
	function(Class, Communicator) {

		var Host = Communicator.extend({
		
			init: function(serverIp, port) {
				this.superclass(serverIp, port, "host");
				this.clientList = {};
		
			/**
			 * Register important callbacks for events the Host cares about
			 */
				var Host = this;
		
				this.on("connect", function(event) {
					if(event.sender == "server") {
				
						// server sends host id
						Host.id = event.data.id;
						Host.fire("selfReady", Host.id);
				
					} else {
				
						// a client connects
						var id = event.sender;
						var deviceType = event.data.deviceType;
						var client = new Client(id, deviceType, Host);
						// add client to list
						addClient.call(Host, client);
						Host.fire("clientConnect", client);
					}
				});
		
				// client disconnects
				this.on("disconnect", function(event) {
					if(event.sender != "server") {
						var id = event.sender;
						var client = Host.getClient(id);
						if(client) {
							Host.fire("clientDisconnect", client);
						}
					}
				});
		
				this.on("websocketClose", function(event) {
					Host.fire("selfDisconnect", event);
				});
		
				this.on("exception", function(event) {
					if(event.sender == "server") {
						Host.fire("serverException", event.data);
					} else {
						Host.fire("clientException", event);
					}
				});
			},
		
			getClient: function(id) {
				if(this.clientList[id]) {
					return this.clientList[id];
				}
				return undefined;
			},
		
			disconnectClient: function(id, message) {
				if(this.getClient(id)) {
					send(id, "disconnected", message);
					removeClient(id);
				}
			}
		});
		
		// ===== private =====
	
		function addClient(client) {
			if(!this.getClient(client.id)) {
				this.clientList[client.id] = client;
			}
		}
		
		function removeClient(id) {
			if(this.getClient(id)) {
				this.clientList[id] = undefined;
			}
		}	
	
		var Client = Class.extend({
			init: function(id, deviceType, host) {
				this.id = id;
				this.deviceType = deviceType;
				this.host = host;
			},
		
			send: function(message, jsonData) {
				this.host.send(id, message, jsonData);
			},
		
			disconnect: function(message) {
				this.host.disconnectClient(id, message);
			}
		});
		
		return Host;
	}
);