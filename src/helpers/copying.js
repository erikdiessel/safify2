/*
Helper method to copy over attributes from one object
to another.
*/

var s = (function(s) {
    
    // Mutates *base*
    s.copy = function(base, copying) {
        for(key in copying) {
            base[key] = copying[key];
        };
    };
    
    return s;
}(s || {}));