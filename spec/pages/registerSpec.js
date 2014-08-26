define(['src/vendor/mithril', 'src/pages/register', 'src/framework/mediator',
        '../helpers/jquery'],
function(m, registerPage, md, __) {

describe('The register page', function() {

	beforeEach(function(done) {
    	m.module(document.body, registerPage);
    	
    	this.usernameInput = $('input[placeholder="Username"]');
        this.passwordInput = $('input[placeholder="Password"]');
        this.registerButton = $('button:contains("Register")');
        
        // Ensure that the module is loaded by mithril
        setTimeout(done, 40);
    });
    
    it("has a username input", function() {
    	expect(this.usernameInput.length).toBe(1);
    });
    
    it("has a password input", function() {
    	expect(this.passwordInput.length).toBe(1);
    });
    
    it("has a register button", function() {
    	expect(this.registerButton.length).toBe(1);
    });
    
    it("publishes to 'register' when register button is clicked", function() {
    	var username = "user73";
        var password = "pa$$word";
        // Enter username and password
        this.usernameInput.val(username).change();
        this.passwordInput.val(password).change();
        
        spy = jasmine.createSpy();
        md().on('register', spy);
        
        this.registerButton.click();
        expect(spy).toHaveBeenCalledWith(username, password);
    })

});

});