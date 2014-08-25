/*
The generator component
=======================

This component generates passwords based on various
criteria:
* length
* possible characters:
* uppercase
* numbers
* special characters

The criteria can be adapted in the UI. A *generate* 
button allows to create a new password (with the same
criteria). Additionally the generated password can be
used directly as the password for a new entry.
*/

define(function(require) {

var m    = require('../vendor/mithril'),
range    = require('../subcomponents/range'),
button   = require('../subcomponents/button'),
checkbox = require('../subcomponents/checkbox'),
generatePassword = require('../model/generator');


function controller() {
    // localization
    this.l = s.localize(s.generator.l);

    this.length = m.prop(6);
    this.useUppercase = m.prop(true);
    this.useNumbers = m.prop(true);
    this.useSpecialCharacters = m.prop(false);

    // private data store;
    // this prevents recomputation of the
    // password when the user wants to create an
    // entry with this password;
    var password;

    this.password = function() {
        // return the password and store it in
        // the private attribute *password*
        return password = generatePassword(
            this.length(),
            this.useUppercase(),
            this.useNumbers(),
            this.useSpecialCharacters()
        );
    };

    /* Creates an entry with the current generated
       password.
    */
    this.createEntryWithPassword = function() {
        // TODO
    }
};

function view(ctrl) {
    return m("div", [
        m("span", ctrl.password()),
        range({
            value: ctrl.length,
            min: 4,
            max: 16,
            label: ctrl.l.length
        }),
        checkbox({ label: ctrl.l.uppercase, checked: ctrl.useUppercase }),
        checkbox({ label: ctrl.l.numbers, checked: ctrl.useNumbers }),
        checkbox({ label: ctrl.l.special_characters, 
          checked: ctrl.useSpecialCharacters
        }),
        button({
            onclick: ctrl.createEntryWithPassword,
            label: ctrl.l.create_entry_with_generated_password
        })
    ]);    
};

return {
	controller: controller,
    view: view
};

});