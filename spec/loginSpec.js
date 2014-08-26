define(function(require) {
var m     = require('src/vendor/mithril'),
loginPage = require('src/pages/login'),
md        = require('src/framework/mediator'),
__        = require('./helpers/jquery');

describe("The loginPage", function() {

	beforeEach(function(done) {
    	m.module(document.body, loginPage);
        
        this.loginButton = $("button:contains('Login')");
        this.usernameInput = $("[placeholder=Username]");
        this.passwordInput = $("[placeholder=Password]");
        
        // Ensure that the module is rendered.
        // Since Mithril displays a changing html only after
        // a new Frame is shown (with 60 fps this happens
        // every 17ms), we need to wait this time so that
        // it is always loaded
        setTimeout(done, 20);
    });
    
    it("has a password field", function() {
    	expect($('[type=password]').attr('placeholder')).toEqual("Password");
    });
    
    it("has a Login button", function() {
    	expect(this.loginButton.length).toBeGreaterThan(0);
    });
    
    it("has a usernameInput", function() {
    	expect(this.usernameInput.length).toBeGreaterThan(0);
    });
    
    it("has a passwordInput", function() {
    	expect(this.passwordInput.length).toBeGreaterThan(0);
    });
    
    it("Publishes to 'login' when a user clicks on the button", function() {
    	var username = "User73";
        var password = "pa$$word";
        
        var spy = jasmine.createSpy();
        md().on('login', spy);
        
        // Enter username and password
        this.usernameInput.val(username).change(); 
        this.passwordInput.val(password).change();
        // Click on login button
        this.loginButton.click();
 
 		expect(spy).toHaveBeenCalledWith(username, password);
    });
});

});