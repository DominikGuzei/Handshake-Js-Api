define(['basic/Class', 'basic/event/Publisher'], function(Class, EventPublisher) {
	
	/**
	 * The Communicator wraps around the Websocket API and 
	 * the Handshake messaging protocol to publish messages
	 * as events other code can listen to
	 */
	
	var Communicator = Class.extend({

		init: function(serverIp, port, requestString) {

			this.serverIp = serverIp;
			this.port = port;

			// defines the request part of the connection
			// Handshake uses this to distinguish between
			// hosts and clients that connect to hosts
			this.requestString = requestString;

			// standard Websocket states taken from the manual
			this.websocketStates = {
				CONNECTING: 0, // not connected yet
				OPEN: 1, // connection established (success)
				CLOSING: 2, // currently closing
				CLOSED: 3 // connection was closed
			}

		},

		connect: function() {

			if(!this.websocket || 
				(this.websocket && this.websocket.readyState == this.websocketStates.CLOSED)) {

				// try to connect to given server and port with the request string	
				this.websocket = new WebSocket("ws://" + 
																			 this.serverIp + ":" + 
																			 this.port + "/" + 
																			 this.requestString);

				// publish websocket events
				var communicator = this;
				this.websocket.onopen = function(event) { communicator.fire("websocketOpen", event); };
				this.websocket.onclose = function(event) { communicator.fire("websocketClose", event); };
				this.websocket.onerror = function(event) { communicator.fire("websocketError", event); };
				this.websocket.onmessage = function(event) { communicator.messageHandler(event); };
				return true;
			} 
			return false;
		},

		disconnect: function() {

			if(this.websocket.readyState == this.websocketStates.OPEN) {
				this.websocket.close();
			} 
		},

		send: function(receiver, message, jsonData) {
			this.websocket.send(receiver + " " + message + (jsonData? " " + JSON.stringify(jsonData) : ""));
		},

		connectionStatus: function() {
			return this.websocket.readyState;
		},

		isConnected: function() {
			if(this.connectionStatus == this.websocketStates.OPEN) {
				return true;
			}
			return false;
		},

		messageHandler: function (event) {
			var message = event.data;

			// message filter expression
			var messageFilter = message.match(/(\w*) (\w*) *(.*)/);
			if(messageFilter) {
				var sender = messageFilter[1];
				var message = messageFilter[2];
				var jsonArguments = messageFilter[3];
				if(jsonArguments && jsonArguments != "") {
					var argumentData = JSON.parse(jsonArguments);
				}

				// publish message event to listeners
				this.fire(message, { 
					sender: sender,
					data: argumentData
				});
			} 
		}

	});


	/**
	 * Apply Basic.EventPublisher functionality to the 
	 * communicator, so that it can register and fire events
	 */
	Communicator.augment(EventPublisher);
	
	// return communicator as requireJS module
	return Communicator;
});