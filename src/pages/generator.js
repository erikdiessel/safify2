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

var s = (function(s) {
    s.generator = s.generator || {};
    
    s.generator.controller = function() {
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
            return password = s.generatePassword(
            	this.length(),
                this.useUppercase(),
                this.useNumbers(),
                this.useSpecialCharacters()
            );
        };
        
        this.checkboxControllers = [
            { label: this.l.uppercase, checked: this.useUppercase },
            { label: this.l.numbers,   checked: this.useNumbers	  },
            { label: this.l.special_characters, 
              checked: this.useSpecialCharacters
            }
        ].map(function(setting) {
        	return new s.checkbox.controller(setting);   
        });
        
        this.lengthController = new s.range.controller({
            value: this.length,
            min: 4,
            max: 16,
            label: this.l.length
        });
        
        /* Creates an entry with the current generated
           password.
		*/
        this.createEntryWithPassword = function() {
            // TODO
        }
    };
    
    s.generator.view = function(ctrl) {
    	return m("div", [
            m("span", ctrl.password()),
			s.range.view(ctrl.lengthController),
            ctrl.checkboxControllers.map(function(ctrl) {
                return s.checkbox.view(ctrl);
            }),
            s.button({
                onclick: ctrl.createEntryWithPassword,
                label: ctrl.l.create_entry_with_generated_password
            })
        ]);    
    };
    
    
    return s;
}(s || {}));