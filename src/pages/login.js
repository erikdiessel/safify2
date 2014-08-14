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
        
        this.login = function() {
        	s.user.login(this.username, this.password)
        }.bind(this);
        
        // Redirect to the generator page
        this.toGenerator = m.route.bind(this, 'generator');
        
        this.toRegistration = m.route.bind(this, 'register');
    }
    
    // TODO: augment the markup
    s.login.view = function(ctrl) {
    	return m('div', [
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