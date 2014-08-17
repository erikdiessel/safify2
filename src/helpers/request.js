/*
Request helper
==============

This is a facade to m.request, with already
set parameters, for a convenient interface
to the safify-API.
*/

/// <reference path="../vendor/mithril.d.ts" />
/// <reference path="extend.js" />


/*:
interface RequestConfig {
	method: string;
    url: string;
    data: {};
}
*/

var s = (function(s) {

    // Helper function which returns the URL encoding of
    // the object.
    var toURLEncoding = function(obj/*::{}*/)/*::string*/ {
        return Object.keys(obj).map(function (prop) {
            return encodeURIComponent(prop) + "="
                 + encodeURIComponent(obj[prop]);
        }).join("&");
    };
    
    s.Request = function(config/*::RequestConfig*/) {
    	// attributes
    	this.next = undefined;
        this.handlers = {};
        this.defaultHandler = undefined;
        this.firstRequest = this;
        this.request/*::XMLHttpRequest*/ = undefined;
        this.method = config.method;
        
        var isGetRequest = config.method.toLowerCase() == "get";
        
        var encodedData = toURLEncoding(config.data);
        
        this.url = config.url + (isGetRequest ? "?" + encodedData : "");
                                
        this.payload = isGetRequest ? "" : encodedData;
        
        this.request = new XMLHttpRequest();
        
        this.request.onload = function() {
        	if(this.handlers[this.request.status]) {
            	// call the corresponding handler with the response
            	this.handlers[this.request.status](this.request.responseText);
            } // there is no specific handler for this status code
            else {
            	var defaultHandler = this.getDefaultHandler();
            	if(defaultHandler) {
                	defaultHandler(this.request.responseText);
                } else { // unhandled error
                	throw new Error("Error during request for: " + url +
                    	" with data: " + JSON.stringify(config.data));
                }
            }
            if(this.next) {
                // execute next request
                this.next.execute();
            }
        }.bind(this);
    };
    
    s.Request.prototype.thereafter = 
    function(nextRequest/*::Request*/)/*::Request*/ {
    	this.next = nextRequest;
        // store reference to the first request in the chain
        nextRequest.firstRequest = this.firstRequest;
        return nextRequest;
    }; 
    
    s.Request.prototype.onStatus = function(status/*::number*/, callback) {
    	this.handlers[status] = callback;
        return this;
    };
    
    s.Request.prototype.otherwise = function(callback) {
    	this.defaultHandler = callback;
        return this;
    };
    
    s.Request.prototype.execute = function() {
        this.request.open(this.method, this.url);
        this.request.setRequestHeader('Content-Type',
                	'application/x-www-form-urlencoded; charset=UTF-8');
    	this.request.send(this.payload);
    }
    
    s.Request.prototype.send = function()/*::void*/ {
    	this.firstRequest.execute();
    };
    
    s.Request.prototype.getDefaultHandler = function() {
    	// Search recursively for a defaultHandler
    	if(this.defaultHandler) {
        	return this.defaultHandler;
        } else {
        	if(this.next) {
            	return this.next.getDefaultHandler();
            } else {
            	return undefined;
            }
        }
    }
    
    return s;
}(s || {}));