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

Object.keys(messages).forEach(function(key) {
 	console.log('key: '+ key);

	md().on(key, function() {
    	console.log('key: ' +  key + " triggered");
    	message = messages[key];
        /* We signalize the end of an asynchronous
           computation to force a redraw.
        */
        m.endComputation();
    });
});

return function() {
	return m('div.error', message);
};


});