(function() {

// TODO: adapt to AMD
//l = s.localize(s.errorMessages);
/*
var messages = {
	'authentificationFailed': l.authentificationFailed,
    'usernameUsed': l.usernameUsed,
    'usernameNotFound': l.usernameNotFound,
    // reset message if this happens
    'transitioned': ""
};
*/

var message = "";

for(var key in messages) {
	md().on(key, function() {
    	message = messages[key];
    });
}

s.errorMessages = function() {
	return m('div.error', message);
};


}());