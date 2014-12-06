define(function(require) {
	
var m  = require('../vendor/mithril'),
input  = require('../subcomponents/input'),
button = require('../subcomponents/button'),
l      = require('../localization/localized'),
md     = require('../framework/mediator'),
__     = require('../helpers/bind'),
header = require('../components/header');

function controller() { 
    this.username = m.prop("");
    this.password = m.prop("");
    this.passwordRepetition = m.prop("");
    
    this.register = function() {
        if(this.password() == this.passwordRepetition()) {
    	    md().pub('register', this.username(), this.password());
        } else {
            md().pub('repetitionDoesNotMatch');
        }
    }.bind(this);
};

function view(ctrl) {
	return m('div', [
        header(),
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
        input({
            value: ctrl.passwordRepetition,
            label: l.passwordRepetition,
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