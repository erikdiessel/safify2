/*
Editing page
============

On the editing page, a password entry can be
edited and deleted.
*/

define(function(require) {

var m  = require('../vendor/mithril'),
   md  = require('../framework/mediator')
    l  = require('../localization/localized'),
input  = require('../subcomponents/input'),
button = require('../subcomponents/button'),
user   = require('../model/user'),
PropertyEntry  = require('../model/propertyEntry');
	
function controller() {
    this.entryId = m.route.param("entryId");

    this.entry = new PropertyEntry(user.getEntries()[this.entryId]);

    this.saveEntry = function() {
        md().pub('changeEntry', this.entryId, this.entry.serialize());
        m.route('overview');   
    }.bind(this);

    // TODO: Change this into displaying a confirmation
    // dialog first
    //this.deleteEntry = user.deleteEntry.bind(this, index);
};

function view(ctrl) {
    return m('div', [
        input({
            type: 'text',
            label: l.title,
            value: ctrl.entry.title
        }),
        input({
            type: 'text',
            label: l.username,
            value: ctrl.entry.username
        }),
        input({
            type: 'text',
            label: l.password,
            value: ctrl.entry.password
        }),
        button({
            onclick: ctrl.saveEntry,
            label: l.save,
            callToAction: true
        }),
        button({
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