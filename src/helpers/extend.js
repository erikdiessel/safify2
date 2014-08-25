/*
Extend helper
============

Extends a given javascript object with another one,
without mutating it. It returns the extended version;
*/

define(['./copying'], function(copy) {
	return function(base/*::{}*/, extension/*::{}*/)/*::{}*/ {
    	var result = {};
        copy(result, base);
        copy(result, extension);
        return result;
    };
});