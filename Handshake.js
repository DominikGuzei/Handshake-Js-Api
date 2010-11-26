var Basic = Basic || {};
Basic.version = "0.0.1";/**
 * Implement a save indexOf functionality on array
 */
var Native = Array.prototype;

Basic.Array = {};

Basic.Array.indexOf = (Native.indexOf) ?
    function(a, val) {
      return Native.indexOf.call(a, val);
  } :
  function(a, val) {
      for (var i=0; i<a.length; i=i+1) {
          if (a[i] === val) {
              return i;
          }
      }

      return -1;
  };/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 */
// Inspired by base2 and Prototype

(function(){
  var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\bsuperclass\b/ : /.*/;
  // The base Class implementation (does nothing)
  Basic.Class = function(){};
  
  // Create a new Class that inherits from this class
  Basic.Class.extend = function(prop) {
    var superclass = this.prototype;
    
    // Instantiate a base class (but only create the instance,
    // don't run the init constructor)
    initializing = true;
    var prototype = new this();
    initializing = false;
    
    // Copy the properties over onto the new prototype
    for (var name in prop) {
      // Check if we're overwriting an existing function
      prototype[name] = typeof prop[name] == "function" && 
        typeof superclass[name] == "function" && fnTest.test(prop[name]) ?
        (function(name, fn){
          return function() {
            var tmp = this.superclass;
            
            // Add a new ._super() method that is the same method
            // but on the super-class
            this.superclass = superclass[name];
            
            // The method only need to be bound temporarily, so we
            // remove it when we're done executing
            var ret = fn.apply(this, arguments);        
            this.superclass = tmp;
            
            return ret;
          };
        })(name, prop[name]) :
        prop[name];
    }
    /**
 		 * Simple class augmentation -> adds prototype
		 * functions and public object vars to receiver
		 */
		
		function augment(other) {
			// copy prototype functions
			for(methodName in other.prototype) { 
				if(!this.prototype[methodName]) {
					this.prototype[methodName] = other.prototype[methodName];
				}
			}
			// copy public attributes
			for(prop in other) {
				if(!this[prop]) {
					this[prop] = prop;
				}
			}
		}
		
    // The dummy class constructor
    function Class() {
      // All construction is actually done in the init method
      if ( !initializing && this.init )
        this.init.apply(this, arguments);
    }
    
    // Populate our constructed prototype object
    Class.prototype = prototype;
    
    // Enforce the constructor to be what we expect
    Class.constructor = Class;

    // And make this class extendable
    Class.extend = arguments.callee;
    
		// augment functionality
		Class.augment = augment;
		
    return Class;
  };
})();(function() {
	
	/**
	 * A very simple implementation of an event dispatcher
	 * that can publish events everyone can subscribe to
	 */
	
	Basic.EventPublisher = Basic.Class.extend({
		
	/**
	 * An associative array of "events" which are 
	 * lists of callback functions that get registered
	 * by the 'on' function
	 */
	
		eventList: {},
		
		/**
		 * returns the array of callbacks or false
		 */
		getEventCallbacks: function(eventName) {
			if(this.eventList[eventName]) {
				return this.eventList[eventName];
			}
			return false;
		},
		
		/**
		 * Register a callback to an event
		 */
		on: function(eventName, callback) {
			var callbacks = this.getEventCallbacks.call(this, eventName);
			if(!callbacks) {
				callbacks = this.eventList[eventName] = [];
			}
			if(Basic.Array.indexOf(callbacks, callback) == -1) {
				callbacks.push(callback);
			}
		},
		
		/**
		 * Remove a attached callback from an event
		 */
		detach: function(eventName, callback) {
			var callbacks = this.getEventCallbacks.call(this, eventName);
			if(callbacks) {
				var index = Basic.Array.indexOf(callbacks, callback);
				if(index >= 0) {
					callbacks.splice(index, 1);
					return true;
				}
			}
			return false;
		},
		
		/**
		 * Publish an event with given data to all callbacks
		 */
		fire: function(eventName, data) {
			var callbacks = this.getEventCallbacks.call(this, eventName);
			if(callbacks && callbacks.length > 0) {
				for(var i = 0; i < callbacks.length; i++) {
					callbacks[i](data);
				}
			}
		}
	});
})();var Handshake = Handshake || {};

(function() {

/**
 * The Communicator wraps around the Websocket API and 
 * the Handshake messaging protocol to publish messages
 * as events other code can listen to
 */

Handshake.Communicator = Basic.Class.extend({
	
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
			var connectUrl = "ws://" + this.serverIp + ":" + this.port + "/" + this.requestString
			console.log("connecting via: " + connectUrl);
			// try to connect to given server and port with the request string	
			this.websocket = new WebSocket(connectUrl);

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
Handshake.Communicator.augment(Basic.EventPublisher);

})();(function() {
	
	Handshake.Host = Handshake.Communicator.extend({
		
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
	
	var Client = Basic.Class.extend({
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
})();(function() {
	
	Handshake.Client = Handshake.Communicator.extend({
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
})();