/*
Login page
==========

The login page is the entry point to the webapp.
It provides the login form as well as links to 
the registration form and the generator. Additionally
it contains some promotional text and the bookmarklet
as a link.
*/

define(function(require) {

var m  = require('../vendor/mithril'),
md     = require('../framework/mediator'),
input  = require('../subcomponents/input'),
button = require('../subcomponents/button'),
__	   = require('../helpers/bind'),
user   = require('../model/user'),
l      = require('../localization/localized'),
errorMessages = require('../components/errorMessages');

    
function controller() {
    this.username = m.prop("");
    this.password = m.prop("");

    this.wrong_password = m.prop(false);
    this.wrong_username = m.prop(false);
    this.no_network = m.prop(false);

    this.login = function() {
        md().pub('login', this.username(), this.password());
        /*.subscribe('logged_in', function() { m.route('overview'); })
        .subscribe('authentification_failed', this.authentificationFailed)
        .subscribe('username_not_found', this.usernameNotFound)
        .subscribe('other_error', this.networkError)*/
    }.bind(this);        

    // Redirect to the generator page
    // We pass along undefined, so that no other argument
    // is appended by calling this bounded function
    this.toGenerator = function() { m.route('generator'); };

    this.toRegistration = function() { m.route('register'); };
};


// TODO: augment the markup
function view(ctrl) {
    return m('div', [
        errorMessages(),
        input({
            value: ctrl.username,
            label: l.username,
            type: 'text',
        }),
        input({
            value: ctrl.password,
            label: l.password,
            type: 'password'
        }),
        button({
            onclick: ctrl.login,
            label: l.login,
            callToAction: true
        }),
        button({
            onclick: ctrl.toRegistration,
            label: l.register,
            callToAction: true
        }),
        button({
            onclick: ctrl.toGenerator,
            label: l.generator
        })
    ]);
};

return {
	controller: controller,
    view: view
};

});