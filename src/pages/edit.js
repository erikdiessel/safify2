/*
Editing page
============

On the editing page, a password entry can be
edited and deleted.
*/

define(function(require) {

var m  = require('../vendor/mithril'),
    l  = require('../localization/localized'),
input  = require('../subcomponents/input'),
button = require('../subcomponents/button'),
user   = require('../model/user');
	
function controller() {
    this.entryId = m.route.param("entryId");

    this.entry = user.getEntries()[this.entryId];

    this.saveEntry = function() {
        md().pub('changeEntry', this.entryId, this.entry);
        m.route('overview');   
    }

    // TODO: Change this into displaying a confirmation
    // dialog first
    //this.deleteEntry = user.deleteEntry.bind(this, index);
};

function view(ctrl) {
    return m('div', [
        s.input({
            type: 'text',
            label: l.title,
            value: ctrl.entry.title
        }),
        s.input({
            type: 'text',
            label: l.username,
            value: ctrl.entry.username
        }),
        s.input({
            type: 'text',
            label: l.password,
            value: ctrl.entry.password
        }),
        s.button({
            onclick: ctrl.saveEntry,
            label: l.save,
            callToAction: true
        }),
        s.button({
            label: l.delete,
            onclick: ctrl.deleteEntry,
            classes: ['danger']
        })
    ]);
};

return {
	controller: controller,
    view: view
};

});