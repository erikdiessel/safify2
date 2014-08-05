/*
Request helper
==============

This is a facade to m.request, with already
set parameters, for a convenient interface
to the safify-API.
*/

var s = (function(s) {
    
    s.request = function(options) {
    	return m.request(_.defaults(options, {
            extract: function(xhr) {
                if (xhr.status == 200 || xhr.status == 201) {
                    // return payload
                    return xhr.responseText;
                } else {
                    // return error code
                    return xhr.status;
                }
            },
            
            serialize: function()
        }));    
    };
    
    return s;
}(s || {}));