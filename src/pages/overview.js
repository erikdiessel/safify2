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

define(function(require) {

var m = require('../vendor/mithril'),
entry = require('../components/entry');
    
function controller() {
    this.entryControllers = s.user.entries.map(function(entry, index) {
        return new s.entry.controller(entry, index);
    });
};

function view(ctrl) {
    return m('div', ctrl.entryControllers.map(function(entryCtrl) {
        return s.entry.view(entryCtrl);
    }));
};
    
return {
	controller: controller,
    view: view
};

});