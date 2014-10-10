/* 
Mediator
========
*/

define(function(require) {

require('../helpers/bind');

var Mediator = function() {
    
	var subscriptions = {}; // private variable
    
    /* publishes an event */
    this.pub = function(event/*::string*/ /*, additional information*/) {
    	var additionalInformation = Array.prototype.slice.call(arguments, 1);
        if(subscriptions[event]) {
            subscriptions[event].forEach(function(func) {
                func.apply(this, additionalInformation);
            });
        }
        // Debugging:
        console.log("Event " + event + " was published with data: " +
                    Array.prototype.slice.call(arguments, 1));
    };
    
    // Currying of *pub* for use as a callback
    this.publishing = function(/*arguments*/) {
    	// store for use in returned function
    	var myArguments = arguments;
    	return function() {
        	this.pub.apply(this, myArguments);
        }.bind(this);
    }.bind(this);
    
    // subscribe to an event
    this.on = function(event, callback) {
    	// initialize subscriptions for the event
    	subscriptions[event] = subscriptions[event] || [];
        subscriptions[event].push(callback);
    };
    
    // Reset to original state
    this.reset = function() {
    	subscriptions = {};
    };
};

var _md = undefined;

// Mediator singleton
return function() {
	if(_md) {
    	return _md;
    } else {
    	return _md = new Mediator();
    }
}

});