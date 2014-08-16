/*
Entry class
===========

Represents an entry and provides utility methods for it.
*/

(function() {
	namespace('s');
    s.Entry = function(blueprint/*::{}?*/) {
    	// initialize attributes
        blueprint = blueprint || {};
    	this.title    = m.prop(blueprint.title || "");
        this.username = m.prop(blueprint.username || "");
        this.password = m.prop(blueprint.password || "");
    }
    
    s.Entry.prototype.serialize = function() {
    	return {
        	title: this.title,
        	username: this.username,
            password: this.password
        };
    };
    
    // static function
    s.Entry.deserialize = function(entry)/*::Entry*/ {
		return new Entry(entry);
    }
}());