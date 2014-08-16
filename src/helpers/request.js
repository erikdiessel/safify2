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
        
        this.request = new XMLHttpRequest();
                
        var isGetRequest = config.method.toLowerCase() == "get";
        
        var encodedData = toURLEncoding(config.data);
        
        var url = config.url + (isGetRequest ? "?" + encodedData : "");
                                
        this.payload = isGetRequest ? "" : encodedData;
        
        this.request.open(config.method, url);
        
        this.request.setRequestHeader('Content-Type',
                	'application/x-www-form-urlencoded; charset=UTF-8');
        
        
        this.request.onload = function() {
        	if(this.handlers[this.request.status]) {
            	// call the corresponding handler with the response
            	this.handlers[this.request.status](this.request.responseText);
            } // there is no specific handler for this status code
            else {
            	if(this.getDefaultHandler()) {
                	this.defaultHandler(this.request.responseText);
                } else { // unhandled error
                	throw "Error during request for: " + url +
                    	" with data: " + JSON.stringify(config.data);
                }
            }
            if(this.next) {
                // execute next request
                this.next.send();
            }
        }.bind(this);
    };
    
    s.Request.prototype.thereafter = 
    function(nextRequest/*::Request*/)/*::Request*/ {
    	this.next = nextRequest;
        return nextRequest;
    }; 
    
    s.Request.prototype.onStatus = function(status/*::number*/, callback) {
    	this.handlers[status] = callback;
        return this;
    };
    
    s.Request.prototype.otherwise = function(callback) {
    	this.handlers['default'] = callback;
        return this;
    }; 
    
    s.Request.prototype.send = function()/*::void*/ {
    	this.request.send(this.payload);
    }
    
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