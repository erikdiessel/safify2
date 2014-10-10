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

var m          = require('../vendor/mithril'),
entryComponent = require('../components/entry'),
user           = require('../model/user');
    
function controller() {

};

function view(ctrl) {
    return m('div', user.getEntries().map(function(entry, index) {
        return entryComponent(entry, index)
    }));
};
    
return {
	controller: controller,
    view: view
};

});