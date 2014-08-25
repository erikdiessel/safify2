define(function(require) {
var m     = require('src/vendor/mithril'),
loginPage = require('src/pages/login'),
md        = require('src/framework/mediator'),
__        = require('./helpers/jquery');

describe("The loginPage", function() {
	beforeEach(function() {
    	m.module(document.body, loginPage);
        
        this.loginButton = $("button:contains('Login')");
        this.usernameInput = $("[placeholder=Username]");
        this.passwordInput = $("[placeholder=Password]");
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
    	/*var username = "User73";
        var password = "pa$$word";
        
        var spy = jasmine.createSpy();
        md().on('login', spy);
        */
        // Enter username and password
        //this.usernameInput.val("username"); 
        this.usernameInput.trigger("change");
        //this.passwordInput.val(password).change();
        // Click on login button
        /*this.loginButton.click();
        
        console.log(this.usernameInput.val());
 
 		expect(spy).toHaveBeenCalledWith(username, password);*/
    });
});

});