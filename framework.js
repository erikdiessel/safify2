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