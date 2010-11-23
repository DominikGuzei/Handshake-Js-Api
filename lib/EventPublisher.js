(function() {
	
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
})();