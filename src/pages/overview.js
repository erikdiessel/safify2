/*~
Overview page
=============

On this page, all password entries are shown.
It is loaded directly after a login and provides
the corresponding actions to edit and show an entry.
*/

/// <reference path="../vendor/mithril.d.ts" />
/// <reference path="../model/user.js" />
/// <reference path="../components/entry.js" />

var s = (function(s) {
	s.overview = s.overview || {};
    
    s.overview.controller = function() {
    	this.entryControllers = s.user.entries.map(function(entry, index) {
        	return new s.entry.controller(entry, index);
        });
    };
    
    s.overview.view = function(ctrl) {
    	return m('div', ctrl.entryControllers.map(function(entryCtrl) {
        	return s.entry.view(entryCtrl);
        }));
    }
    
    return s;
}(s || {}));