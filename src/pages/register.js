define(function(require) {
	
var m  = require('../vendor/mithril'),
input  = require('../subcomponents/input'),
button = require('../subcomponents/button'),
l      = require('../localization/localized'),
md     = require('../framework/mediator'),
__     = require('../helpers/bind');

function controller() { 
    this.username = m.prop("");
    this.password = m.prop("");
    
    this.register = function() {
    	md().pub('register', this.username(), this.password());
    }.bind(this);
};

function view(ctrl) {
	return m('div', [
    	input({
        	value: ctrl.username,
        	label: l.username,
            type: 'text'
        }),
        input({
        	value: ctrl.password,
            label: l.password,
            type: 'password'
        }),
        button({
        	onclick: ctrl.register,
            label: l.register
        })
    ]);
};

return {
	controller: controller,
    view: view
};
    
});