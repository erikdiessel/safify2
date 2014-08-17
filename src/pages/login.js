/*
Login page
==========

The login page is the entry point to the webapp.
It provides the login form as well as links to 
the registration form and the generator. Additionally
it contains some promotional text and the bookmarklet
as a link.
*/

var s = (function(s) {
	s.login = s.login || {}; // for localization
    
    
    s.login.controller = function() {
    	this.l = s.localize(s.login.l);
    
    	this.username = m.prop("");
        this.password = m.prop("");
        
        this.wrong_password = m.prop(false);
        this.wrong_username = m.prop(false);
        this.no_network = m.prop(false);
        
        this.login = function() {
            s.user.login(this.username(), this.password())
            .subscribe('logged_in', function() { m.route('overview'); })
            .subscribe('authentification_failed', this.authentificationFailed)
            .subscribe('username_not_found', this.usernameNotFound)
            .subscribe('other_error', this.networkError)
        }.bind(this);
        
        // Redirect to the generator page
        // We pass along undefined, so that no other argument
        // is appended by calling this bounded function
        this.toGenerator = function() { m.route('generator'); };
        
        this.toRegistration = function() { m.route('register'); };
    };
    
    s.login.controller.prototype.resetErrorMessages = function() {
    	this.wrong_password(false);
        this.wrong_username(false);
        this.no_network(false);
    }

    s.login.controller.prototype.authentificationFailed = function() {
    	this.resetErrorMessages();
        this.wrong_password(true);
    };
    
    s.login.controller.prototype.usernameNotFound = function() {
    	this.resetErrorMessages();
        this.wrong_username(true);
    };
    
    s.login.controller.prototype.networkError = function() {
    	this.resetErrorMessages();
        this.no_network(true);
    };
    
    
    // TODO: augment the markup
    s.login.view = function(ctrl) {
    	return m('div', [
        	s.errorMessage({
            	message: ctrl.l.authentificationFailed,
                visible: ctrl.wrong_password
            }),
        	s.input({
                value: ctrl.username,
            	label: ctrl.l.username,
                type: 'text',
            }),
            s.input({
            	value: ctrl.password,
                label: ctrl.l.password,
           		type: 'password'
            }),
            s.button({
            	onclick: ctrl.login,
                label: ctrl.l.login,
                callToAction: true
            }),
            s.button({
            	onclick: ctrl.toRegistration,
                label: ctrl.l.register,
                callToAction: true
            }),
            s.button({
            	onclick: ctrl.toGenerator,
                label: ctrl.l.generator
            })
            
        ])
    };
    
    return s;
}(s || {}));