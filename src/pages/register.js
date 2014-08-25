define(function(require) {
	
var m  = require('../vendor/mithril'),
input  = require('../subcomponents/input'),
button = require('../subcomponents/button')
__     = require('../helpers/bind');

function controller() { 
    this.username = m.prop("");
    this.password = m.prop("");
    
    this.register = function() {
    	user.register(this.username(), this.password())
        .subscribe('registered', function() {
        	m.route('overview');
        });
    }.bind(this);
};

function view(ctrl) {
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
};

return {
	controller: controller,
    view: view
}
    
});