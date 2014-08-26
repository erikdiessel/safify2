define(function(require) {

var m = require('src/vendor/mithril'),
md    = require('src/framework/mediator'),
__    = require('../helpers/jquery'),
__    = require('src/helpers/bind'),
generatorPage = require('src/pages/generator');


/*~
When testing a mithril application we have to take care of it's
special characteristic:
* The view rendering happens only after a getAnimationFrame-request
finishes. This means, that we can only guarantee that the view was
rendered ca. 34ms (1 frame when 30 fps) after m.module or m.render
was called.
We therefore have to wrap all expectations concerning elements
which are newly rendered in a setTimeout with a timeout > 34ms.
*/

describe("The generator page", function() {

	beforeEach(function(done) {
    	m.module(document.body, generatorPage);
        
        this.passwordSpan = $('span');
        this.lengthRange = $('[type=range]');
        this.regenerateButton = $('button:contains(Regenerate)');
        this.numbersCheckbox = $('label:contains(Numbers) input');
        this.uppercaseCheckbox = $('label:contains(Uppercase) input');
        this.specialCheckbox = $('label:contains(Special) input');
        
        setTimeout(done, 40); // ensure mithril has rendered module
    });
    
    it("has a password output with default parameters", function() {
    	expect(this.passwordSpan.length).toBe(1);
        // default is: include uppercase and numbers
        expect(this.passwordSpan.text()).toMatch(/^([a-z]|[A-Z]|[0-9])+$/);
        // default length: 6
        expect(this.passwordSpan.text().length).toEqual(6);
    });

	it("generates a new password when regenerate is clicked", function(done) {
        expect(this.regenerateButton.length).toBe(1);
        
        var oldPassword = this.passwordSpan.text();
        this.regenerateButton.click();
        var newPassword = this.passwordSpan.text();
        setTimeout(function() {
        	// password should have changed now
        	expect(newPassword).not.toEqual(oldPassword);
            done();
        }, 40)
    });
    
    it("allows to set the length of the password", function(done) {
    	expect(this.lengthRange.length).toBe(1);
        this.lengthRange.val(15).change();
        setTimeout(function() {
             // password has now length 15
       		expect(this.passwordSpan.text().length).toBe(15);
            done();
        }.bind(this), 40);
    });
    
    it("has a checkbox to control if numbers are included", function(done) {
    	expect(this.numbersCheckbox.length).toBe(1);
        this.numbersCheckbox.prop('checked', false).change();
        // Make a longer password to ensure, that the password
        // doesn't just matches accidentally the regular expression
        this.lengthRange.val(16).change();
        setTimeout(function() {
        	// password includes no numbers
        	expect(this.passwordSpan.text()).toMatch(/([a-z]|[A-Z])+/);
            done();
        }.bind(this), 40);
    });
    
    it("has a checkbox to control if uppercase letters are used", function(done) {
    	expect(this.uppercaseCheckbox.length).toBe(1);
        this.uppercaseCheckbox.prop('checked', false).change();
        this.lengthRange.val(16).change();
        setTimeout(function() {
        	// password doesn't include uppercase letters
        	expect(this.passwordSpan.text()).toMatch(/([a-z]|[0-9])+/);
            done();
        }.bind(this), 40);
    });
    
    it("has a checkbox to control if special characters are used", function(done) {
    	expect(this.specialCheckbox.length).toBe(1);
        this.specialCheckbox.prop('checked', true).change();
        this.lengthRange.val(16).change();
        setTimeout(function() {
        	// password includes at least one special character
            expect(this.passwordSpan.text()).toMatch(
            	/.*[\!\$\%\&\/\(\)\=\?\+\-\*\{\}\[\]].*/
            );
            done();
        }.bind(this), 40);
    });

});


});