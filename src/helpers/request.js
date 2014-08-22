/*
Request helper
==============
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

define(['../helpers/bind'], function() {

    // Helper function which returns the URL encoding of
    // the object.
    var toURLEncoding = function(obj/*::{}*/)/*::string*/ {
        return Object.keys(obj).map(function (prop) {
            return encodeURIComponent(prop) + "="
                 + encodeURIComponent(obj[prop]);
        }).join("&");
    };
    
    Request = function(config/*::RequestConfig*/) {
        this.handlers = {};
        this.defaultHandler = undefined;
        
        var isGetRequest = config.method.toLowerCase() == "get";
        
        var encodedData = toURLEncoding(config.data);
        
        var url = config.url + (isGetRequest ? "?" + encodedData : "");
                                
        var payload = isGetRequest ? "" : encodedData;
        
        var request = new XMLHttpRequest();
        
        request.onload = function() {
        	if(this.handlers[request.status]) {
            	// call the corresponding handler with the response
            	this.handlers[request.status](request.responseText);
            } // there is no specific handler for this status code
            else {
            	if(this.defaultHandler) {
                	this.defaultHandler(request.responseText);
                } else { // unhandled error
                	throw new Error("Error during request for: " + url +
                    	" with data: " + JSON.stringify(config.data));
                }
            }
        }.bind(this);
        
		request.open(config.method, url);
		request.setRequestHeader('Content-Type',
        		'application/x-www-form-urlencoded; charset=UTF-8');
     	request.send(payload);
    };
    
    Request.prototype.onStatus = function(status/*::number*/, callback) {
    	this.handlers[status] = callback;
        return this;
    };
    
    Request.prototype.otherwise = function(callback) {
    	this.defaultHandler = callback;
        return this;
    };
    
    return Request;
});