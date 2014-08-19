/*
Namespace helper
=============

Provides a way to define a namespace, so that it is
indepent of the load order of corresponding files.

Example usage:
	namespace('s.pages.login')	
*/

(function(global) {
    function namespace(path/*::string*/)/*::void*/ {
        var components = path.split('.');
        global[components[0]] = global[components[0]] || {}
        var currentScope = global[components[0]];
        for(var i=1; i<components.length; i++) {
        	currentScope[components[i]] = currentScope[components[i]] || {};
        	currentScope = currentScope[components[i]];
        }
    }
    
    // export function
    global.namespace = namespace;
}(this));


/* 
Mediator
========
*/

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
};

var _md = undefined;

// Mediator singleton
var md = function() {
	if(_md) {
    	return _md;
    } else {
    	return _md = new Mediator();
    }
}
