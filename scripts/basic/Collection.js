/** 
 * This is a helper module to implement convenient functionality
 * on collections like arrays and objects
 */

define(function() {
		var Native = Array.prototype;
        //return an object to define the "my/shirt" module.
        return {
	
			/**
			 * Implement a save indexOf functionality on array
			 */
            indexOf: (Native.indexOf) ?
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
			  }
        }
    }
);


