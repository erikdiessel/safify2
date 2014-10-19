/*
Entry component
===============
This component provides the UI for the overview pages
and implements all handlers for actions like editing 
and viewing.
*/

/// <reference path="../vendor/mithril.d.ts" />

define(function(require) {
    
var m  = require('../vendor/mithril'),
    l  = require('../localization/localized'),
button = require('../subcomponents/button');

// should be augmented with markup
return function(entry, index) {
    var edit = function() {
        m.route("edit/" + index);
    };
    //m.route.bind(this, "edit/" + index);

    return m('div', [
        m('span', entry.title),
        button({
            onclick: edit,
            label: l.edit
        })
    ]);
};

});