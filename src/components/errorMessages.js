define(function(require) {

var md = require('../framework/mediator'),
l      = require('../localization/localized');

var messages = {
	'authentificationFailed': l.authentificationFailed,
    'usernameUsed': l.usernameUsed,
    'usernameNotFound': l.usernameNotFound,
    // reset message if this happens
    'transitioned': ""
};


var message = "";

for(var key in messages) {
	console.log('key: '+ key);

	md().on(key, function() {
    	//console.log('key: ' +  key);
    	message = messages[key];
        m.redraw(true);
    });
}

return errorMessages = function() {
	return m('div.error', message);
};


});