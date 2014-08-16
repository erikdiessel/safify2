/*
Request helper
==============

This is a facade to m.request, with already
set parameters, for a convenient interface
to the safify-API.
*/

/// <reference path="../vendor/mithril.d.ts" />
/// <reference path="extend.js" />



var s = (function(s) {

    // Helper function which returns the URL encoding of
    // the object.
    var toURLEncoding = function(obj/*::{}*/)/*::string*/ {
        return Object.keys(obj).map(function (prop) {
            return encodeURIComponent(prop) + "="
                 + encodeURIComponent(obj[prop]);
        }).join("&");
    };
    
    var Request = function() {
    
    }
    
    s.request = function(options/*::MithrilXHROptions*/)/*::MithrilPromise*/ {
    	var defaults = {
            extract: function(xhr) {
                if (xhr.status == 200 || xhr.status == 201) {
                    // return payload
                    return xhr.responseText;
                } else {
                    // return error code
                    return xhr.status;
                }
            },
            
            serialize: toURLEncoding,
            
            deserialize: function(data) {
            	return data;
            },
            
            config: function(xhr) {
            	xhr.setRequestHeader('Content-Type',
                	'application/x-www-form-urlencoded; charset=UTF-8');
            } 
        };
        
        return m.request(s.extend(defaults, options));
    };
    
    return s;
}(s || {}));