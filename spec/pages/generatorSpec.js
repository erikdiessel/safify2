define(function(require) {

var m = require('src/vendor/mithril'),
md    = require('src/framework/mediator'),
__    = require('../helpers/jquery'),
generatorPage = require('src/pages/generator');

describe("The generator page", function() {

	beforeEach(function(done) {
    	m.module(document.body, generatorPage);
        
        this.passwordSpan = $('span');
        this.lengthRange = $('[type=range]');
        this.regenerateButton = $('button:contains(Regenerate)')
        
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

});


});