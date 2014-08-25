/*
Helper method to copy over attributes from one object
to another.
*/

define(function() {
    // Mutates *base*
    return function(base, copying) {
        for(var key in copying) {
            base[key] = copying[key];
        };
    };
});