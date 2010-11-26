/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 */
// Inspired by base2 and Prototype
// ported to require js by Dominik Guzei
// added augement functionality

define(function() {
		
	var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\bsuperclass\b/ : /.*/;
	
	// The base Class implementation (does nothing)
	var Class = function(){};

	// Create a new Class that inherits from this class
  Class.extend = function(prop) {
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
       		if(tmp != undefined) {
            	this.superclass = tmp;
			}

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
			// soft copy prototype functions
			for(methodName in other.prototype) { 
				if(!this.prototype[methodName]) {
					this.prototype[methodName] = other.prototype[methodName];
				}
			}
			// soft copy public attributes
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
	
	// return the Class object to requireJS
	return Class;
});