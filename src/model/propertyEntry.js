/*
Entry class
===========

Represents an entry and provides utility methods for it
so that the attributes are mithril-Properties for direct
access with input fields.
*/

define(function(require) {

var m = require('../vendor/mithril');
	
var Entry = function(blueprint/*::{}?*/) {
    // initialize attributes
    blueprint = blueprint || {};
    this.title    = m.prop(blueprint.title || "");
    this.username = m.prop(blueprint.username || "");
    this.password = m.prop(blueprint.password || "");
}

Entry.prototype.serialize = function() {
    return {
        title: this.title(),
        username: this.username(),
        password: this.password()
    };
};

// // static function
// Entry.deserialize = function(entry)/*::Entry*/ {
//     return new Entry(entry);
// }

return Entry;

});