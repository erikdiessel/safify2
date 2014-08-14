/*
Entry component
===============
This component provides the UI for the overview pages
and implements all handlers for actions like editing 
and viewing.
*/

/// <reference path="../vendor/mithril.d.ts" />

var s = (function(s) {
	s.entry = {};
    
    s.entry.controller = function(entry, index) {
    	this.title = entry.name;
        
        this.edit = m.route.bind(this, "edit/" + index);
    };
    
    // should be augmented with markup
    s.entry.view = function(ctrl) {
    	return m('div', [
        	m('span', ctrl.title),
            s.button({
            	onclick: ctrl.edit,
                label: ctrl.l.edit
            })
        ]);
    };
    
    return s;
}(s || {}))