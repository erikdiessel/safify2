/*
Editing page
============

On the editing page, a password entry can be
edited and deleted.
*/

define(function(require) {

var m  = require('../vendor/mithril'),
input  = require('../subcomponents/input'),
button = require('../subcomponents/button')
user   = require('../model/user');
	
function controller() {
    // localization
    this.l = s.localize(s.edit.l);

    this.entryId = m.route.param("entryId");

    this.entry = user.entries.getEntry(this.entryId);

    this.saveEntry = function() {
        md().pub('changeEntry', this.entryId, this.entry);
        m.route('overview');   
    }

    // TODO: Change this into displaying a confirmation
    // dialog first
    this.deleteEntry = user.deleteEntry.bind(this, index);
};

function view(ctrl) {
    return m('div', [
        s.input({
            type: 'text',
            label: ctrl.l.title,
            value: ctrl.entry.title
        }),
        s.input({
            type: 'text',
            label: ctrl.l.username,
            value: ctrl.entry.username
        }),
        s.input({
            type: 'text',
            label: ctrl.l.password,
            value: ctrl.entry.password
        }),
        s.button({
            onclick: ctrl.saveEntry,
            label: ctrl.l.save,
            callToAction: true
        }),
        s.button({
            label: ctrl.l.delete,
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