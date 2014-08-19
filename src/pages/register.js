(function() {
	
namespace('s.pages.register');

s.pages.register.controller = function() {
	this.l = s.localize(s.pages.register.l);
    
    this.username = m.prop("");
    this.password = m.prop("");
    
    this.register = function() {
    	s.user.register(this.username(), this.password())
        .subscribe('registered', function() {
        	m.route('overview');
        });
    }.bind(this);
}

s.pages.register.view = function(ctrl) {
	return m('div', [
    	s.input({
        	value: ctrl.username,
        	label: ctrl.l.username,
            type: 'text'
        }),
        s.input({
        	value: ctrl.password,
            label: ctrl.l.password,
            type: 'password'
        }),
        s.button({
        	onclick: ctrl.register,
            label: ctrl.l.register
        })
    ]);
}
    
}());