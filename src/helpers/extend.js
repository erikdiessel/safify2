/*
Extend helper
============

Extends a given javascript object with another one,
without mutating it. It returns the extended version;
*/

var s = (function(s) {
	s.extend = function(base/*::{}*/, extension/*::{}*/)/*::{}*/ {
    	var result = {};
        s.copy(result, base);
        s.copy(result, extension);
        return result;
    };
    
    return s;
}(s || {}));