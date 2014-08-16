(function() {

namespace('s.pages.autofill');

/// <reference path="../vendor/mithril.d.ts" />

s.pages.autofill.controller = function() {

    var handle = function(origin, data) {
    	this.url = origin;
        this.data = data;
    }.bind(this);
    
    window.addEventListener('message', function(event) {
    	var origin = event.origin;
        var data = event.data;
        handle(origin, data);
    });
    
    
    
}

}());