/*
Entry component
===============
This component provides the UI for the overview pages
and implements all handlers for actions like editing 
and viewing.
*/

/// <reference path="../vendor/mithril.d.ts" />

var s = (function(s) {
	s.entry = {};
    
    s.entry.controller = function(entry, index) {
    	this.title = entry.name;
        
        this.edit = m.route.bind(this, "edit/" + index);
    };
    
    // should be augmented with markup
    s.entry.view = function(ctrl) {
    	return m('div', [
        	m('span', ctrl.title),
            s.button({
            	onclick: ctrl.edit,
                label: ctrl.l.edit
            })
        ]);
    };
    
    return s;
}(s || {}));
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
/*
Autofill module
===============

This module provides all functionality for
the autofilling feature.
It contains a function which autofills and 
autosubmits a given form.
*/

define(function() {
	
//namespace('s.helpers');


// Converts a given html-string into the element represented
// by that string.
var htmlToElement = function(html/*::string*/)/*::HTMLElement*/ {
	var div = document.createElement('div');
    div.innerHTML = html;
    return div.children[0];
};


/* Heuristic for finding username and password form inputs:
The username-input field is the input tag with type 'text'
or 'email' with no value attribute or value=""
The password field is simple the input with type='password'.
*/

// Return the input inside the form where the username is entered
var getUsernameInput = function(form/*::HTMLElement*/)/*::HTMLElement*/ {
	// We have to user Array.prototype.slice.call here to convert the 
    // nodelist returned by getElementsByTagName into a regular array.
	return Array.prototype.slice.call(form.getElementsByTagName('input'))
    	.filter(function(inputTag) {
            return (inputTag.type == 'email' || inputTag.type == 'text')
                && inputTag.value == ""; 	 
    })[0]; // return the first that matches (should only be one)
};

var getPasswordInput = function(form/*::HTMLElement*/)/*::HTMLElement*/ {
	return Array.prototype.slice.call(form.getElementsByTagName('input'))
    	.filter(function(inputTag) {
    		return inputTag.type == 'password';
    })[0]; // return the first that matches (should only be one)	
};

var setActionOriginIfNeeded =
function(form/*::HTMLElement*/, siteOrigin/*::string*/)/*::void*/ {
	// check if action-url is relative 
    // this is exactly then the case when the origin of safify
    // is the origin of form.action, since it's automatically
    // inserted during the creation of the form element
	if (form.action.indexOf(document.location.origin) != -1) {
    	// Possible problem: If siteOrigin already contains a 
        // '/' at the end, we get a double slash.
    	form.action = siteOrigin +
        	form.action.substring(document.location.origin.length);
    }
};
 
return function(formHTML/*::string*/, siteOrigin/*::string*/,
	     username/*::string*/, password/*::string*/)/*::HTMLElement*/ {
	var form = htmlToElement(formHTML);
    var usernameInput = getUsernameInput(form);
    var passwordInput = getPasswordInput(form);
    if(usernameInput) {
        usernameInput.value = username;	
    }
    passwordInput.value = password;
    setActionOriginIfNeeded(form, siteOrigin);
    return form; // ready to be submitted
};



});
/*
Function.bind polyfill
======================

Since on phantomjs Function.bind is not available,
we have to use a polyfill.
The polyfill is taken from [Mozilla]
(https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind)
*/

if (!Function.prototype.bind) {
  Function.prototype.bind = function (oThis) {
    if (typeof this !== "function") {
      // closest thing possible to the ECMAScript 5
      // internal IsCallable function
      throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
    }

    var aArgs = Array.prototype.slice.call(arguments, 1), 
        fToBind = this, 
        fNOP = function () {},
        fBound = function () {
          return fToBind.apply(this instanceof fNOP && oThis
                 ? this
                 : oThis,
                 aArgs.concat(Array.prototype.slice.call(arguments)));
        };

    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();

    return fBound;
  };
}
/*
Helper method to copy over attributes from one object
to another.
*/

var s = (function(s) {
    
    // Mutates *base*
    s.copy = function(base, copying) {
        for(var key in copying) {
            base[key] = copying[key];
        };
    };
    
    return s;
}(s || {}));
/*
Extend helper
============

Extends a given javascript object with another one,
without mutating it. It returns the extended version;
*/

var s = (function(s) {
	s.extend = function(base/*::{}*/, extension/*::{}*/)/*::{}*/ {
    	var result = {};
        s.copy(result, base);
        s.copy(result, extension);
        return result;
    };
    
    return s;
}(s || {}));
/*
Localization helper
===================

For localization we need to detect the
user's language. Because we want the localization
to be placed in sperate files but also to be bound
to a specific page, we create a helper which can be
used in the controller to specify the localization 
strings.
*/

var s = (function(s) {
    s.localize = function(localization) {
        // set page.l to the localized strings
        var locale = (navigator.language || navigator.userLanguage)
        	.substring(0, 2);
        // english localization as fallback
        return localization[locale] || localization['en'];
    };
    
    return s;
}(s || {}));
/*
Request helper
==============

This is a facade to m.request, with already
set parameters, for a convenient interface
to the safify-API.
*/

/// <reference path="../vendor/mithril.d.ts" />
/// <reference path="extend.js" />


/*:
interface RequestConfig {
	method: string;
    url: string;
    data: {};
}
*/

var s = (function(s) {

    // Helper function which returns the URL encoding of
    // the object.
    var toURLEncoding = function(obj/*::{}*/)/*::string*/ {
        return Object.keys(obj).map(function (prop) {
            return encodeURIComponent(prop) + "="
                 + encodeURIComponent(obj[prop]);
        }).join("&");
    };
    
    s.Request = function(config/*::RequestConfig*/) {
    	// attributes
    	this.next = undefined;
        this.handlers = {};
        this.defaultHandler = undefined;
        this.firstRequest = this;
        this.request/*::XMLHttpRequest*/ = undefined;
        this.method = config.method;
        
        var isGetRequest = config.method.toLowerCase() == "get";
        
        var encodedData = toURLEncoding(config.data);
        
        this.url = config.url + (isGetRequest ? "?" + encodedData : "");
                                
        this.payload = isGetRequest ? "" : encodedData;
        
        this.request = new XMLHttpRequest();
        
        this.request.onload = function() {
        	if(this.handlers[this.request.status]) {
            	// call the corresponding handler with the response
            	this.handlers[this.request.status](this.request.responseText);
            } // there is no specific handler for this status code
            else {
            	var defaultHandler = this.getDefaultHandler();
            	if(defaultHandler) {
                	defaultHandler(this.request.responseText);
                } else { // unhandled error
                	throw new Error("Error during request for: " + this.url +
                    	" with data: " + JSON.stringify(config.data));
                }
            }
            if(this.next) {
                // execute next request
                this.next.execute();
            }
        }.bind(this);
    };
    
    s.Request.prototype.thereafter = 
    function(nextRequest/*::Request*/)/*::Request*/ {
    	this.next = nextRequest;
        // store reference to the first request in the chain
        nextRequest.firstRequest = this.firstRequest;
        return nextRequest;
    }; 
    
    s.Request.prototype.onStatus = function(status/*::number*/, callback) {
    	this.handlers[status] = callback;
        return this;
    };
    
    s.Request.prototype.otherwise = function(callback) {
    	this.defaultHandler = callback;
        return this;
    };
    
    s.Request.prototype.execute = function() {
        this.request.open(this.method, this.url);
        this.request.setRequestHeader('Content-Type',
                	'application/x-www-form-urlencoded; charset=UTF-8');
    	this.request.send(this.payload);
    }
    
    s.Request.prototype.send = function()/*::void*/ {
    	this.firstRequest.execute();
    };
    
    s.Request.prototype.getDefaultHandler = function() {
    	// Search recursively for a defaultHandler
    	if(this.defaultHandler) {
        	return this.defaultHandler;
        } else {
        	if(this.next) {
            	return this.next.getDefaultHandler();
            } else {
            	return undefined;
            }
        }
    }
    
    return s;
}(s || {}));
/*
Localization for the generator page
===================================
*/

var s = (function(s) {
    s.generator = s.generator || {};
    
    s.generator.l = {
        en: {
            generator: "Generator",
            length: "Length",
            uppercase: "Uppercase",
            numbers: "Numbers",
            special_characters: "Special Characters",
            generate: "Generate",
            back: "Back",
            passwords: "Passwords",
            create_entry_with_generated_password: "Create entry with this password"
        },
        de: {
            generator: "Generator",
            length: "Länge",
            uppercase: "Großbuchstaben",
            numbers: "Zahlen",
            special_characters: "Sonderzeichen",
            generate: "Generieren",
            back: "Zurück",
            passwords: "Passwörter",
            create_entry_with_generated_password: "Eintrag mit diesem Passwort erstellen"
        },
        fr: {
            generator: "Génératrice",
            length: "Longueur",
            uppercase: "Majuscules",
            numbers: "Chiffres",
            special_characters: "Charactères spécials",
            generate: "Générer",
            back: "Retour",
            passwords: "Mots de passe",
            create_entry_with_generated_password: "Créer un article avec ce mot de passe"
        }
    };
    
    return s;
}(s || {}));
var s = (function(s) {
	namespace('s.login');
    
    s.login.l = {
      	en: {
			username: "Username",
            password: "Master Password",
            authentificationFailed: "Wrong password or username",
            login: "Login",
            register: "Register",
            generator: "Generator"
        },
		de: {

      	},
      	fr: {

      	}
    };
    
    return s;
}(s || {}));
(function() {

namespace('s.pages.register');

s.pages.register.l = {
	en: {
    	username: "Username",
        password: "Password",
        passwordRepetition: "Password Repetition",
        register: "Register"
    }
}


}());
(function() {
// Use for AMD


}());
/*
Routes
======

The routes specify which page is loaded
when a certain URL is loaded.
It also is sort of a table of contents 
of the app.

Since the definition of the routes also
activates directly the corresponding module,
we have to ensure, that all modules are loaded
before the routes are defined. For this we wrap
the definition in a setTimeout with interval 0,
so that it is placed at the end of the execution
queue.
*/

setTimeout(function() {
    m.route(document.body, "", {
   		"": s.login,
        "overview": s.overview,
        "edit/:entryId": s.edit,
        "generator": s.generator,
        // "autofill":
        "register": s.pages.register
    }); 
});

/*~
API interface
=============
This module provides an interface to the safify-api
(safify-api.herokuapp.com). All interactions with
the API should happen using the following functions.
We use the native XMLHttpRequest functions because we
don't want to include a library like jQuery because
of performance reasons (increased code size).
*/

/// <reference path="../helpers/request.js" />

var s = (function (s) {
    // exposed as public constant, so that it can
    // be mocked for tests
    s.API_BASE_URL = "https://safify-api.herokuapp.com/";

    // This private function returns the url for
    // a specific path of the API
    var API_URL = function (path/*::string*/)/*::string*/ {
        // important: use https:// protocol
        return s.API_BASE_URL + path;
    };



    /*~
    For ajax-requests we intentionally don't use the
    mithril-API since it requires actually more code
    and requires the developer to understand the mithril-API
    in detail. We therefore use the standard
    XMLHttpRequest-object which makes this approach
    also portable to other frameworks.
    */
    // This function makes an AJAX-request to fetch the
    // password data.
    // username: string
    // password: string   The server password
    // handlers: {
    // 		onAuthentificationFailed: function
    //		onUsernameNotFound: function,
    //		onNoConnection: function
    // }
    // returns: promise which is resolved when success,
    // and passed the response data
    // The respective functions in handlers are called
    // when the AJAX-request returns such a success / error.
    // The function uses the API endpoint '/passwords'.
    
    s.retrieveData = 
    function (username/*::string*/,
    		  password/*::string*/)/*::Request*/ {
        return new s.Request({
        	method: "GET",
            url: API_URL('passwords'),
            data: {
            	"username": username,
            	"password": password
            }
        }).onStatus(200, function(response) {
        	m().pub('dataReceived', response)
        }).onStatus(401, function() {
        	m().pub('authentificationFailed');
        }).onStatus(403, function() {
        	m().pub('usernameNotFound');
        });
    };
    
    // Additional constants for this functions, so
    // that clients don't have to hardcode status
    // codes.
    s.retrieveData.OK_STATUS = 200;
    s.retrieveData.AUTHENTIFICATION_FAILED_STATUS = 401;
    s.retrieveData.USERNAME_NOT_FOUND_STATUS = 403;


    // This function reqisters a user on the server
    // (via the endpoin '/register').
    // It should *only* be called after an API-call
    // to check whether the username is already used
    // (via s.checkUsernameUsed).
    s.registerUser = function (username/*::string*/,
    						   password/*::string*/)/*::MithrilPromise*/ {
    	return new s.Request({
        	method: "POST",
            url: API_URL("register"),
            data: {
            	"username": username,
                "password": password
            }
        }).onStatus(201, md().publishing('loggedIn'))
        .onStatus(409, md().publishing('usernameUsed'));
    };
    
    s.registerUser.OK_STATUS = 201;

    // username: string
    // handlers: {
    // onUsernameFree: function
    // onUsernameUsed: function
    // }
    // DEPRECATED !
    s.checkForUsername = 
    function (username/*::string*/)/*::MithrilPromise*/ {
    	return new s.Request({
        	method: "GET",
            url: API_URL("username_not_used"),
            data: {
            	'username': username
            }
        });
    };
    
    s.checkForUsername.OK_STATUS = 200;
    s.checkForUsername.USERNAME_USED_STATUS = 409;

    // Changes the password for authentification on the server
    // to a new one.
    // username: string
    // oldPassword: string   password used before
    // newPassword: string
    // callback: function    triggered when the request completes
    s.changeServerPassword =
    function (username/*::string*/,  oldPassword/*::string*/,
              newPassword/*::string*/)/*::MithrilPromise*/ {
              
        return new s.Request({
        	method: 'POST',
            url: API_URL('change_password'),
            data: {
            	'username': username,
                'password': oldPassword,
                'new_password': newPassword
            }
        });      
    };
    
    s.changeServerPassword.OK_STATUS = 201;

    // data: string    The password list to save
    // callback: function     Executed when the request completes
    s.savePasswordList =
    function (username/*::string*/, password/*::string*/,
    		  data/*::string*/)/*::MithrilPromise*/ { 
              
        return new s.Request({
        	method: 'POST',
            url: API_URL('passwords'),
            data: {
            	'username': username,
                'password': password,
                'password_list': data
            }
        });
    };
    
    s.savePasswordList.OK_STATUS = 201;

    return s;
}(s || {}));

/*
Entry class
===========

Represents an entry and provides utility methods for it.
*/

(function() {
	namespace('s');
    s.Entry = function(blueprint/*::{}?*/) {
    	// initialize attributes
        blueprint = blueprint || {};
    	this.title    = m.prop(blueprint.title || "");
        this.username = m.prop(blueprint.username || "");
        this.password = m.prop(blueprint.password || "");
    }
    
    s.Entry.prototype.serialize = function() {
    	return {
        	title: this.title,
        	username: this.username,
            password: this.password
        };
    };
    
    // static function
    s.Entry.deserialize = function(entry)/*::Entry*/ {
		return new Entry(entry);
    }
}());
/*
The model part of the generator
==============================

This module provides functions for
the generation of passwords, given 
a certain length and the allowed
characters.
*/

define(function() {
    
	var LETTERS = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j",
                   "k", "l", "m", "n", "o", "p", "q", "r", "s", "t",
                   "u", "v", "w", "x", "y", "z"];
    var UPPERCASE = LETTERS.map(function(letter) {
        return letter.toUpperCase();
    });
    var NUMBERS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
    var SPECIALCHARS = ["!","$","%","&","/","(",")","=",
                        "?","+","-","*","{","}","[","]"];
    
    
    // Returns a random password with the specified length and
    // characters included. It does not guarantee that all 
    // types of characters are included. 
    return function(length, uppercase, numbers, specialchars) {
        // specify the characters which can be included in 
        // the generated passwords
        var allowedCharacters = LETTERS.concat(
            uppercase ? UPPERCASE : []
        ).concat(
            numbers ? NUMBERS : []
        ).concat(
            specialchars ? SPECIALCHARS : []
        );
        
        // helper function which returns an array
        // with *n* elements consisting of the 
        // return values of *func*.
        var generate = function(n, func) {
            var res = [];
            for(var i=0; i<n; i++) {
                res.push(func());
            }
            return res;
        };
        
        // helper function which returns a random
        // integer in the interval [0,max-1]
        var randomIndex = function(max) {
            return Math.floor(Math.random() * max);
        };
        
        // Pick *length* characters at random from
        // the allowed characters and return the string
        // composed of them.
        return generate(length, function() {
        	return allowedCharacters[randomIndex(allowedCharacters.length)];    
        }).join('');
    };


});
/*
Security
========

The functions in this module provide the 
encryption and decryption facilities as 
well as the the password hashing.

Since these functions are *highly* security
sensitive, we seperate them from the other
UI-related modules.

All security related functions are based
on the Stanford Javascript Cryptographic
Library (sjcl), created by Dan Boneh et al.
Since this is created by security researchers,
the likelihood of implementation weaknesses
is slow.
sjcl automatically collects entropy from 
the user (mouse movements) and can therefore
also provide sufficient randomness for a secure
cryptographic random number generator (which
is not directly available in javascript).
*/

/// <reference path="../vendor/sjcl.d.ts" />

var s = (function(s) {
    
    /*
    Converts the given *password* string
    into the client password which is used
    for encryption and decryption.
    We hash the password so many times, so 
    that an attacker trying to guess a 
    password with a dictionary attack would
    have to compute the many hash iterations
    each time. This renders such an attack 
    inefficient.
    
    For a better efficiency we store the value
    of the client password in memory. It then
    has to be computed only one time, and users
    of this function don't have to store the
    value themselves.
    This doesn't create a security hole, since
    the value of the underlying password string
    is already in memory and even more important.
    */
    
    var clientPassword;
    // We have to check if username or password have
    // changed, in this case, the client password
    // *has* to be recomputed.
    var oldUsername;
    var oldPassword;
    
    s.clientPassword = function(username/*::string*/,
    							password/*::string*/)/*::string*/ {
        
        // When the value is already computed, (with
        // the same username and password), return
        // it immediately and stop the computation.
        if (clientPassword && username === oldUsername &&
            password === oldPassword) {
            return clientPassword;
        }
        
        // store for next function call
        oldUsername = username;
        oldPassword = password;
        
        /*
        We use a salt with many bits of entropy 
        (from random.org) and aditionally add the
        SHA-256 hash of the username to it.
        This makes the salt different for every user.
        Therefore an attacker has to adapt his technique
        to every user. An attack against the whole
        Safify-service with rainbow tables derived
        from the fixed salt-part is therefore not
        possible.
        */
        var salt = [71,52,235,209,156,43,102,198,190,98,
              3,221,187,29,74,138,50,179,179,16]
        	.concat(sjcl.hash.sha256.hash(username));
        
                    
        /* The number of iterations is chosen in a way
           such that the time for an attacker is big
           enough to defeat a dictionary attack while
           at the same time being feasible to compute
           on a mobile device in an order of 100ms.
           Additionally we haven't chosen a multiple
           of 1000, because the attacker might be 
           adapted to this often chosen iterations
           constant (for example the attacker might
           possess an FPGA programmed for exactly 1000
           iterations). 
        */
        var iterations = 3497;
        
        /* 
        For encryption and decryption, the sjcl-
        library accepts only strings as keys.
        Since the pbkdf2-function (Password based
        key derivation function 2) outputs a list
        of numbers, we return its JSON-representation.
        
        The pbkdf2 - function is a cryptographic
        function which increases the entropy in
        the password string such that it returns
        a good key with enough entropy which can
        be used for AES-encryption and decryption.
        */
        
        // Store the computed password for subsequent
        // function calls.
        clientPassword = JSON.stringify(
            sjcl.misc.pbkdf2(password, salt, iterations)
        );
        
        return clientPassword;
    };
    
    /*
    The server password
    ------------------
    
    The server password is the password used for
    authentification at the safify-api server.
    It guarantees that an attacker can't delete
    or modify the password list on the server.
    
    The server password is computed in a way such that
    an attacker learning it gains no information about
    the client password used for encryption.
    We use the same algorithm as for the client password
    but with different salts, such that they are
    unrelated.
    
    The server password can be leaked (because it is
    known to the server and stored there), but this 
    should not compromise the security of the encrypted
    password list.
    */
    
    // Again, store for subsequent function calls
    var serverPassword;
    var oldUsername;
    var oldPassword;
    
    
    s.serverPassword = function(username/*::string*/,
    							password/*::string*/)/*::string*/ {
        if(serverPassword && username == oldUsername
           && password == oldPassword) {
            return serverPassword;
        }
        
        // store for next function call
        oldUsername = username;
        oldPassword = password;
        
    	var salt = [184, 83, 26, 133, 22, 40, 115, 123, 141, 115,
               39, 53, 168, 172, 49, 165, 106, 215, 114, 180]
       		.concat(sjcl.hash.sha256.hash(username));
                    
        // Chosen differently than in the computation
        // of the client password to defeat a potential
        // attack based on similarities between the 
        // generation of those two passwords.
        var iterations = 2347;
                    
 		serverPassword = JSON.stringify(
        	sjcl.misc.pbkdf2(password, salt, iterations)
      	);
        
        return serverPassword;
    };
    
    
    /*
    Encryption and decryption
    -------------------------
    
    For encryption and decryption we use AES-256,
    which underlies the algorithms in
    *sjcl.encrypt* and *sjcl.decrypt*.
    The *sjcl.encrypt* and *sjcl.decrypt* functions
    return objects which include the initialization
    vector, so that they can be used standalone
    */
    
    s.encrypt = function(username/*::string*/,
                         password/*::string*/,
                         data/*::string*/)/*::sjcl.SjclCipherEncrypted*/ {
        var key = s.clientPassword(username, password);
        return sjcl.encrypt(key, data);
    };
    
    s.decrypt = function(username/*::string*/,
                         password/*::string*/,
                         data/*::sjcl.SjclCipherEncrypted*/)/*::string*/ {
    	var key = s.clientPassword(username, password);
        return sjcl.decrypt(key, data);
    };
   
    
    
    return s;
}(s || {}));
(function() {

md().on('loggedIn', function() {
	m.route('overview');
});

}());
/*
User module
===========

This module provides all functionality related
to the user login, registration and password
changing functionality. (It manages as well
the password list.)

The user is implemented as a singleton object.

*/


(function() {
	
var _username = undefined;
var _password = undefined;
var entries = [];

function save() {
	var serverPassword = s.serverPassword(username, password);
    var encryptedData = s.encrypt(username,
    							  password,
                                  JSON.stringify(entries));
	s.savePasswordList(username, serverPassword, encryptedData);
}

md().on('login', function(username, password) {
	_username = username; _password = password;
	var serverPassword = s.serverPassword(_username, _password);
	s.retrieveData(username, serverPassword);
});

md().on('register', function(username, password) {
	_username = username; _password = password;
	var serverPassword = s.serverPassword(_username, _password);
    s.registerUser(_username, serverPassword);
});

md().on('createEntry', function(entry) {
	entries.push(entry);
    save();
});

md().on('deleteEntry', function(index) {
	entries.splice(index, 1);
    save();
});

md().on('changeEntry', function(index, newEntry) {
	entries[index] = newEntry;
    save();
});

md().on('dataReceived', function(data) {
	// decrypt data
    var decrypted = s.decrypt(_username, _password, data);
    entries = JSON.parse(decrypted);
    md().pub('loggedIn');
});
    
}());


var s = (function(s) {

//     var Subscription = function() {
//     	this.subscriptions = {};
//     }
    
//     Subscription.prototype.subscribe
//     = function(event/*::string*/, callback)/*::Subscription*/ {
//     	// initialize subscription list, if not already done
//     	this.subscriptions[event] = this.subscriptions[event] || [];
//         this.subscriptions[event].push(callback);
//         return this;
//     }
    
//     // Notify the subscribers of the event
//     Subscription.prototype.notify = function(event/*::string*/)/*::void*/ {
//     	if(this.subscriptions[event]) {
//             this.subscriptions[event].forEach(function(callback) {
//                 callback();
//             });
//         }
//     }
	
    
    
    
//     // private constructor
//     var User = function() {
//         this.username = "";
//         this.password = "";
//         this.entries = [];
//     };
    
//     User.prototype.login = function(username, password) {
//         this.username = username;
//         this.password = password;
        
//         var subscription = new Subscription();
        
// 		s.retrieveData(this.username, this.serverPassword())
//         .onStatus(s.retrieveData.OK_STATUS, function(data) {
//         	this.entries = s.decrypt(this.username,
//             	this.clientPassword(), data);
//             subscription.notify('logged_in');
//         }).onStatus(s.retrieveData.AUTHENTIFICATION_FAILED_STATUS, function() {
//         	subscription.notify('authentification_failed');
//         }).onStatus(s.retrieveData.USERNAME_NOT_FOUND_STATUS, function() {
//         	subscription.notify('username_not_found');
//         }).otherwise(function() {
//         	subscription.notify('other_error');
//         }).send();
        
//         return subscription;
//     };
    
//     User.prototype.register = function(username, password) {
//     	this.username = username;
//         this.password = password;
        
//         var subscription = new Subscription();
        
//         s.checkForUsername(this.username)
//         .onStatus(s.checkForUsername.USERNAME_USED_STATUS, function() {
//         	subscription.notify('username_used');
//         }).onStatus(s.checkForUsername.OK_STATUS, function() {
//         	// We assume that this works, since the previous API-query
//             // was successfull and happened only some ms ago.
//         	s.registerUser(this.username, this.password)
//             .otherwise(function() { subscription.notify('not_registered') })
//             .send();
//             subscription.notify('registered');
            
//         }.bind(this)).send();
        
//         return subscription;
//     }
    
//     User.prototype.serverPassword = function() {
//     	return s.serverPassword(this.username, this.password);
//     };
    
//     User.prototype.clientPassword = function() {
//         return s.clientPassword(this.username, this.password);
//     };
        
//     /* TODO: not finished implementation    
//     User.prototype.setEntries = function(data) {
//         this.passwordList = s.decrypt(this.username,
//         	this.clientPassword(),
//             data        		         
//         );
//     };
//     */
    
//     // Returns a copy of the entry with the specified index.
//     // Changing values of the returned copy should not change
//     // the original entry;
//     User.prototype.getEntry = function(index) {
//     	var entry = this.entries[index];
//     	return {
//         	title:    m.prop(entry.title),
//         	username: m.prop(entry.username),
//             password: m.prop(entry.password)
//         };
//     };
    
//     // Sets the entry with the given *index* to the *newEntry*
//     // *newEntry should store its attributes as m.prop-properties
//     // It can therefore be used directly with User.getEntry
//     User.prototype.setEntry
//     = function(index/*::number*/, newEntry/*::Entry*/)/*::void*/ {
//     	this.entries[index] = newEntry.serialize();
//     };
    
//     // Inserts *newEntry* in the entries list.
//     // *newEntry* should store its attributes as m.prop-properties.
//     User.prototype.addEntry = function(newEntry) {
//     	this.entries.push(newEntry.serialize())
//     };
    
//     // Removes the entry with the specified index 
//     // from the entries list
//     User.prototype.deleteEntry =
//     function(index/*::number*/)/*::void*/ {
//     	this.entries.splice(index, 1);
//     };
        
//     s.user = new User();    
    
    return s;
}(s || {}));
(function() {

namespace('s.pages.autofill');

/// <reference path="../vendor/mithril.d.ts" />

s.pages.autofill.controller = function() {

    var handle = function(origin, data) {
    	this.url = origin;
        this.data = data;
    }.bind(this);
    
    window.addEventListener('message', function(event) {
    	var origin = event.origin;
        var data = event.data;
        handle(origin, data);
    });
    
    
    
}

}());
/*
Editing page
============

On the editing page, a password entry can be
edited and deleted.
*/

var s = (function(s) {
	// localization maybe has already modified s.edit
	s.edit = s.edit || {}; 
	
    s.edit.controller = function() {
    	// localization
        this.l = s.localize(s.edit.l);
    
    	this.entryId = m.route.param("entryId");
        
        this.entry = user.entries.getEntry(this.entryId);
        
        this.saveEntry = function() {
        	md().pub('changeEntry', this.entryId, this.entry);
         	m.route('overview');   
        }
        
        // TODO: Change this into displaying a confirmation
        // dialog first
        this.deleteEntry = user.deleteEntry.bind(this, index);
    };
    
    s.edit.view = function(ctrl) {
    	return m('div', [
        	s.input({
            	type: 'text',
                label: ctrl.l.title,
                value: ctrl.entry.title
            }),
            s.input({
            	type: 'text',
                label: ctrl.l.username,
                value: ctrl.entry.username
            }),
            s.input({
            	type: 'text',
                label: ctrl.l.password,
                value: ctrl.entry.password
            }),
            s.button({
            	onclick: ctrl.saveEntry,
                label: ctrl.l.save,
                callToAction: true
            }),
            s.button({
            	label: ctrl.l.delete,
                onclick: ctrl.deleteEntry,
                classes: ['danger']
            })
        ]);
    };

	return s;
}(s || {}));
/*
The generator component
=======================

This component generates passwords based on various
criteria:
* length
* possible characters:
* uppercase
* numbers
* special characters

The criteria can be adapted in the UI. A *generate* 
button allows to create a new password (with the same
criteria). Additionally the generated password can be
used directly as the password for a new entry.
*/

var s = (function(s) {
    s.generator = s.generator || {};
    
    s.generator.controller = function() {
        // localization
        this.l = s.localize(s.generator.l);
        
        this.length = m.prop(6);
        this.useUppercase = m.prop(true);
        this.useNumbers = m.prop(true);
        this.useSpecialCharacters = m.prop(false);
 		
        // private data store;
        // this prevents recomputation of the
        // password when the user wants to create an
        // entry with this password;
        var password;
       
        this.password = function() {
            // return the password and store it in
            // the private attribute *password*
            return password = s.generatePassword(
            	this.length(),
                this.useUppercase(),
                this.useNumbers(),
                this.useSpecialCharacters()
            );
        };
        
        this.checkboxControllers = [
            { label: this.l.uppercase, checked: this.useUppercase },
            { label: this.l.numbers,   checked: this.useNumbers	  },
            { label: this.l.special_characters, 
              checked: this.useSpecialCharacters
            }
        ].map(function(setting) {
        	return new s.checkbox.controller(setting);   
        });
        
        this.lengthController = new s.range.controller({
            value: this.length,
            min: 4,
            max: 16,
            label: this.l.length
        });
        
        /* Creates an entry with the current generated
           password.
		*/
        this.createEntryWithPassword = function() {
            // TODO
        }
    };
    
    s.generator.view = function(ctrl) {
    	return m("div", [
            m("span", ctrl.password()),
			s.range.view(ctrl.lengthController),
            ctrl.checkboxControllers.map(function(ctrl) {
                return s.checkbox.view(ctrl);
            }),
            s.button({
                onclick: ctrl.createEntryWithPassword,
                label: ctrl.l.create_entry_with_generated_password
            })
        ]);    
    };
    
    
    return s;
}(s || {}));
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
        
        this.resetErrorMessages = function() {
            this.wrong_password(false);
            this.wrong_username(false);
            this.no_network(false);
        }.bind(this);
        
        this.authentificationFailed = function() {
            this.resetErrorMessages();
            this.wrong_password(true);
        }.bind(this);     
        
        this.usernameNotFound = function() {
            this.resetErrorMessages();
            this.wrong_username(true);
        }.bind(this);
    
        this.networkError = function() {
            this.resetErrorMessages();
            this.no_network(true);
        }.bind(this);        
        
        // Redirect to the generator page
        // We pass along undefined, so that no other argument
        // is appended by calling this bounded function
        this.toGenerator = function() { m.route('generator'); };
        
        this.toRegistration = function() { m.route('register'); };
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
/*~
Overview page
=============

On this page, all password entries are shown.
It is loaded directly after a login and provides
the corresponding actions to edit and show an entry.
*/

/// <reference path="../vendor/mithril.d.ts" />
/// <reference path="../model/user.js" />
/// <reference path="../components/entry.js" />

var s = (function(s) {
	s.overview = s.overview || {};
    
    s.overview.controller = function() {
    	this.entryControllers = s.user.entries.map(function(entry, index) {
        	return new s.entry.controller(entry, index);
        });
    };
    
    s.overview.view = function(ctrl) {
    	return m('div', ctrl.entryControllers.map(function(entryCtrl) {
        	return s.entry.view(entryCtrl);
        }));
    }
    
    return s;
}(s || {}));
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
/*
Button subcomponent
===================

This component is a simple topcoat button,
with an attached clicked handler.
*/

var s = (function(s) {
    /*
    We refrain from specifying a controller, since
    this provides a code size overhead: the controller
    for the button has to be initialized and referenced
    in the view. Instead we include the control part in
    a single function which is the view.
    */
    // config: {
    //   // required;  click handler
    // 	 onclick: Function,
    //   // required;  text on the button
    //   label: String,
    //   // if true, button is styled as call-to action button:
    //   callToAction: bool, 
    //   large: bool,
    //   quiet: bool,
    //   // string of additonally attached classes
    //   classes: string
    // }
    s.button = function(config) {
        return m("button", {
            "class": 
            	"topcoat-button" + (config.large ? "--large" : "") +
            		(config.callToAction ? "--cta" : "") +
            		(config.quiet ? "--quiet": "") +
            	" " + (config.classes || ""),
            onclick: config.onclick
        }, config.label);
    };
    
    
    return s;
}(s || {}));
/*
Checkbox subcomponent
=====================

The checkbox subcomponent represents
the controller and view for a topcoat-
styled checkbox
*/

var s = (function(s) {
    
    s.checkbox = {};
    
    
    // *setting.checked* is a m.prop property which is 
    // then bound to the checkbox
    // *setting.label* is the string which is shown next
    // to the checkbox
    s.checkbox.controller = function(setting) {
    	s.copy(this, setting);
    };
    
    s.checkbox.view = function(ctrl) {
        return m("label.topcoat-checkbox", [
            m("input[type=checkbox]", {
                onchange: m.withAttr("checked", ctrl.checked),
                checked: ctrl.checked()
            }),
            m("div.topcoat-checkbox__checkmark"),
            ctrl.label
        ]);
    };
    
    return s;
}(s || {}));

/*
Header subcomponent
===================
*/

(function() {
	namespace('s');
    s.header = function(config) {
    	return
    }
}());
/*
Input-field subcomponent
========================
This subcomponent represents an input field,
with a label and automatic binding.
*/

/// <reference path="../vendor/mithril.d.ts" />

/*:
interface MithrilProperty {
    (value?: any): any
}
*/

/*:
interface InputOptions {
    label: string;
    value: MithrilProperty;
    type: string;
}
*/

var s = (function(s) {
	s.input = 
    function(config/*::InputOptions*/) /*::MithrilVirtualElement*/ {
    	return m('label', [
        	m('input', {
            	type: config.type,
                value: config.value(),
                onchange: m.withAttr('value', config.value),
                placeholder: config.label
            }),
            config.label
        ]);
    };
    
    return s;
}(s || {}));
(function() {
	namespace('s');

	s.modal = function(config, contents) {
    	return m('div.modal', contents);
    }
    
}());
/*
Input range subcomponent
========================

This subcompoenent representsa topcoat range input,
together with a display of the current value.

*/

/// <reference path="../vendor/mithril.d.ts" />

var s = (function(s) {
    s.range = {};
    
    // config: {
    // 	   label: string,
    //	   value: m.prop,
    //     min:   int,
    //     max:   int
	// }
    s.range.controller = function(config) {
        s.copy(this, config);
    }
    
    s.range.view = function(ctrl) {
    	return m("label", [
            m("input[type=range].topcoat-range", {
                min: ctrl.min,
                max: ctrl.max,
                value: ctrl.value(),
                onchange: m.withAttr("value", ctrl.value)
            }),
            ctrl.label
        ]);
    };
    
    return s;
}(s || {}));
/*
 RequireJS 2.1.14 Copyright (c) 2010-2014, The Dojo Foundation All Rights Reserved.
 Available via the MIT or new BSD license.
 see: http://github.com/jrburke/requirejs for details
*/
var requirejs,require,define;
(function(ba){function G(b){return"[object Function]"===K.call(b)}function H(b){return"[object Array]"===K.call(b)}function v(b,c){if(b){var d;for(d=0;d<b.length&&(!b[d]||!c(b[d],d,b));d+=1);}}function T(b,c){if(b){var d;for(d=b.length-1;-1<d&&(!b[d]||!c(b[d],d,b));d-=1);}}function t(b,c){return fa.call(b,c)}function m(b,c){return t(b,c)&&b[c]}function B(b,c){for(var d in b)if(t(b,d)&&c(b[d],d))break}function U(b,c,d,e){c&&B(c,function(c,g){if(d||!t(b,g))e&&"object"===typeof c&&c&&!H(c)&&!G(c)&&!(c instanceof
RegExp)?(b[g]||(b[g]={}),U(b[g],c,d,e)):b[g]=c});return b}function u(b,c){return function(){return c.apply(b,arguments)}}function ca(b){throw b;}function da(b){if(!b)return b;var c=ba;v(b.split("."),function(b){c=c[b]});return c}function C(b,c,d,e){c=Error(c+"\nhttp://requirejs.org/docs/errors.html#"+b);c.requireType=b;c.requireModules=e;d&&(c.originalError=d);return c}function ga(b){function c(a,k,b){var f,l,c,d,e,g,i,p,k=k&&k.split("/"),h=j.map,n=h&&h["*"];if(a){a=a.split("/");l=a.length-1;j.nodeIdCompat&&
Q.test(a[l])&&(a[l]=a[l].replace(Q,""));"."===a[0].charAt(0)&&k&&(l=k.slice(0,k.length-1),a=l.concat(a));l=a;for(c=0;c<l.length;c++)if(d=l[c],"."===d)l.splice(c,1),c-=1;else if(".."===d&&!(0===c||1==c&&".."===l[2]||".."===l[c-1])&&0<c)l.splice(c-1,2),c-=2;a=a.join("/")}if(b&&h&&(k||n)){l=a.split("/");c=l.length;a:for(;0<c;c-=1){e=l.slice(0,c).join("/");if(k)for(d=k.length;0<d;d-=1)if(b=m(h,k.slice(0,d).join("/")))if(b=m(b,e)){f=b;g=c;break a}!i&&(n&&m(n,e))&&(i=m(n,e),p=c)}!f&&i&&(f=i,g=p);f&&(l.splice(0,
g,f),a=l.join("/"))}return(f=m(j.pkgs,a))?f:a}function d(a){z&&v(document.getElementsByTagName("script"),function(k){if(k.getAttribute("data-requiremodule")===a&&k.getAttribute("data-requirecontext")===i.contextName)return k.parentNode.removeChild(k),!0})}function e(a){var k=m(j.paths,a);if(k&&H(k)&&1<k.length)return k.shift(),i.require.undef(a),i.makeRequire(null,{skipMap:!0})([a]),!0}function n(a){var k,c=a?a.indexOf("!"):-1;-1<c&&(k=a.substring(0,c),a=a.substring(c+1,a.length));return[k,a]}function p(a,
k,b,f){var l,d,e=null,g=k?k.name:null,j=a,p=!0,h="";a||(p=!1,a="_@r"+(K+=1));a=n(a);e=a[0];a=a[1];e&&(e=c(e,g,f),d=m(r,e));a&&(e?h=d&&d.normalize?d.normalize(a,function(a){return c(a,g,f)}):-1===a.indexOf("!")?c(a,g,f):a:(h=c(a,g,f),a=n(h),e=a[0],h=a[1],b=!0,l=i.nameToUrl(h)));b=e&&!d&&!b?"_unnormalized"+(O+=1):"";return{prefix:e,name:h,parentMap:k,unnormalized:!!b,url:l,originalName:j,isDefine:p,id:(e?e+"!"+h:h)+b}}function s(a){var k=a.id,b=m(h,k);b||(b=h[k]=new i.Module(a));return b}function q(a,
k,b){var f=a.id,c=m(h,f);if(t(r,f)&&(!c||c.defineEmitComplete))"defined"===k&&b(r[f]);else if(c=s(a),c.error&&"error"===k)b(c.error);else c.on(k,b)}function w(a,b){var c=a.requireModules,f=!1;if(b)b(a);else if(v(c,function(b){if(b=m(h,b))b.error=a,b.events.error&&(f=!0,b.emit("error",a))}),!f)g.onError(a)}function x(){R.length&&(ha.apply(A,[A.length,0].concat(R)),R=[])}function y(a){delete h[a];delete V[a]}function F(a,b,c){var f=a.map.id;a.error?a.emit("error",a.error):(b[f]=!0,v(a.depMaps,function(f,
d){var e=f.id,g=m(h,e);g&&(!a.depMatched[d]&&!c[e])&&(m(b,e)?(a.defineDep(d,r[e]),a.check()):F(g,b,c))}),c[f]=!0)}function D(){var a,b,c=(a=1E3*j.waitSeconds)&&i.startTime+a<(new Date).getTime(),f=[],l=[],g=!1,h=!0;if(!W){W=!0;B(V,function(a){var i=a.map,j=i.id;if(a.enabled&&(i.isDefine||l.push(a),!a.error))if(!a.inited&&c)e(j)?g=b=!0:(f.push(j),d(j));else if(!a.inited&&(a.fetched&&i.isDefine)&&(g=!0,!i.prefix))return h=!1});if(c&&f.length)return a=C("timeout","Load timeout for modules: "+f,null,
f),a.contextName=i.contextName,w(a);h&&v(l,function(a){F(a,{},{})});if((!c||b)&&g)if((z||ea)&&!X)X=setTimeout(function(){X=0;D()},50);W=!1}}function E(a){t(r,a[0])||s(p(a[0],null,!0)).init(a[1],a[2])}function I(a){var a=a.currentTarget||a.srcElement,b=i.onScriptLoad;a.detachEvent&&!Y?a.detachEvent("onreadystatechange",b):a.removeEventListener("load",b,!1);b=i.onScriptError;(!a.detachEvent||Y)&&a.removeEventListener("error",b,!1);return{node:a,id:a&&a.getAttribute("data-requiremodule")}}function J(){var a;
for(x();A.length;){a=A.shift();if(null===a[0])return w(C("mismatch","Mismatched anonymous define() module: "+a[a.length-1]));E(a)}}var W,Z,i,L,X,j={waitSeconds:7,baseUrl:"./",paths:{},bundles:{},pkgs:{},shim:{},config:{}},h={},V={},$={},A=[],r={},S={},aa={},K=1,O=1;L={require:function(a){return a.require?a.require:a.require=i.makeRequire(a.map)},exports:function(a){a.usingExports=!0;if(a.map.isDefine)return a.exports?r[a.map.id]=a.exports:a.exports=r[a.map.id]={}},module:function(a){return a.module?
a.module:a.module={id:a.map.id,uri:a.map.url,config:function(){return m(j.config,a.map.id)||{}},exports:a.exports||(a.exports={})}}};Z=function(a){this.events=m($,a.id)||{};this.map=a;this.shim=m(j.shim,a.id);this.depExports=[];this.depMaps=[];this.depMatched=[];this.pluginMaps={};this.depCount=0};Z.prototype={init:function(a,b,c,f){f=f||{};if(!this.inited){this.factory=b;if(c)this.on("error",c);else this.events.error&&(c=u(this,function(a){this.emit("error",a)}));this.depMaps=a&&a.slice(0);this.errback=
c;this.inited=!0;this.ignore=f.ignore;f.enabled||this.enabled?this.enable():this.check()}},defineDep:function(a,b){this.depMatched[a]||(this.depMatched[a]=!0,this.depCount-=1,this.depExports[a]=b)},fetch:function(){if(!this.fetched){this.fetched=!0;i.startTime=(new Date).getTime();var a=this.map;if(this.shim)i.makeRequire(this.map,{enableBuildCallback:!0})(this.shim.deps||[],u(this,function(){return a.prefix?this.callPlugin():this.load()}));else return a.prefix?this.callPlugin():this.load()}},load:function(){var a=
this.map.url;S[a]||(S[a]=!0,i.load(this.map.id,a))},check:function(){if(this.enabled&&!this.enabling){var a,b,c=this.map.id;b=this.depExports;var f=this.exports,l=this.factory;if(this.inited)if(this.error)this.emit("error",this.error);else{if(!this.defining){this.defining=!0;if(1>this.depCount&&!this.defined){if(G(l)){if(this.events.error&&this.map.isDefine||g.onError!==ca)try{f=i.execCb(c,l,b,f)}catch(d){a=d}else f=i.execCb(c,l,b,f);this.map.isDefine&&void 0===f&&((b=this.module)?f=b.exports:this.usingExports&&
(f=this.exports));if(a)return a.requireMap=this.map,a.requireModules=this.map.isDefine?[this.map.id]:null,a.requireType=this.map.isDefine?"define":"require",w(this.error=a)}else f=l;this.exports=f;if(this.map.isDefine&&!this.ignore&&(r[c]=f,g.onResourceLoad))g.onResourceLoad(i,this.map,this.depMaps);y(c);this.defined=!0}this.defining=!1;this.defined&&!this.defineEmitted&&(this.defineEmitted=!0,this.emit("defined",this.exports),this.defineEmitComplete=!0)}}else this.fetch()}},callPlugin:function(){var a=
this.map,b=a.id,d=p(a.prefix);this.depMaps.push(d);q(d,"defined",u(this,function(f){var l,d;d=m(aa,this.map.id);var e=this.map.name,P=this.map.parentMap?this.map.parentMap.name:null,n=i.makeRequire(a.parentMap,{enableBuildCallback:!0});if(this.map.unnormalized){if(f.normalize&&(e=f.normalize(e,function(a){return c(a,P,!0)})||""),f=p(a.prefix+"!"+e,this.map.parentMap),q(f,"defined",u(this,function(a){this.init([],function(){return a},null,{enabled:!0,ignore:!0})})),d=m(h,f.id)){this.depMaps.push(f);
if(this.events.error)d.on("error",u(this,function(a){this.emit("error",a)}));d.enable()}}else d?(this.map.url=i.nameToUrl(d),this.load()):(l=u(this,function(a){this.init([],function(){return a},null,{enabled:!0})}),l.error=u(this,function(a){this.inited=!0;this.error=a;a.requireModules=[b];B(h,function(a){0===a.map.id.indexOf(b+"_unnormalized")&&y(a.map.id)});w(a)}),l.fromText=u(this,function(f,c){var d=a.name,e=p(d),P=M;c&&(f=c);P&&(M=!1);s(e);t(j.config,b)&&(j.config[d]=j.config[b]);try{g.exec(f)}catch(h){return w(C("fromtexteval",
"fromText eval for "+b+" failed: "+h,h,[b]))}P&&(M=!0);this.depMaps.push(e);i.completeLoad(d);n([d],l)}),f.load(a.name,n,l,j))}));i.enable(d,this);this.pluginMaps[d.id]=d},enable:function(){V[this.map.id]=this;this.enabling=this.enabled=!0;v(this.depMaps,u(this,function(a,b){var c,f;if("string"===typeof a){a=p(a,this.map.isDefine?this.map:this.map.parentMap,!1,!this.skipMap);this.depMaps[b]=a;if(c=m(L,a.id)){this.depExports[b]=c(this);return}this.depCount+=1;q(a,"defined",u(this,function(a){this.defineDep(b,
a);this.check()}));this.errback&&q(a,"error",u(this,this.errback))}c=a.id;f=h[c];!t(L,c)&&(f&&!f.enabled)&&i.enable(a,this)}));B(this.pluginMaps,u(this,function(a){var b=m(h,a.id);b&&!b.enabled&&i.enable(a,this)}));this.enabling=!1;this.check()},on:function(a,b){var c=this.events[a];c||(c=this.events[a]=[]);c.push(b)},emit:function(a,b){v(this.events[a],function(a){a(b)});"error"===a&&delete this.events[a]}};i={config:j,contextName:b,registry:h,defined:r,urlFetched:S,defQueue:A,Module:Z,makeModuleMap:p,
nextTick:g.nextTick,onError:w,configure:function(a){a.baseUrl&&"/"!==a.baseUrl.charAt(a.baseUrl.length-1)&&(a.baseUrl+="/");var b=j.shim,c={paths:!0,bundles:!0,config:!0,map:!0};B(a,function(a,b){c[b]?(j[b]||(j[b]={}),U(j[b],a,!0,!0)):j[b]=a});a.bundles&&B(a.bundles,function(a,b){v(a,function(a){a!==b&&(aa[a]=b)})});a.shim&&(B(a.shim,function(a,c){H(a)&&(a={deps:a});if((a.exports||a.init)&&!a.exportsFn)a.exportsFn=i.makeShimExports(a);b[c]=a}),j.shim=b);a.packages&&v(a.packages,function(a){var b,
a="string"===typeof a?{name:a}:a;b=a.name;a.location&&(j.paths[b]=a.location);j.pkgs[b]=a.name+"/"+(a.main||"main").replace(ia,"").replace(Q,"")});B(h,function(a,b){!a.inited&&!a.map.unnormalized&&(a.map=p(b))});if(a.deps||a.callback)i.require(a.deps||[],a.callback)},makeShimExports:function(a){return function(){var b;a.init&&(b=a.init.apply(ba,arguments));return b||a.exports&&da(a.exports)}},makeRequire:function(a,e){function j(c,d,m){var n,q;e.enableBuildCallback&&(d&&G(d))&&(d.__requireJsBuild=
!0);if("string"===typeof c){if(G(d))return w(C("requireargs","Invalid require call"),m);if(a&&t(L,c))return L[c](h[a.id]);if(g.get)return g.get(i,c,a,j);n=p(c,a,!1,!0);n=n.id;return!t(r,n)?w(C("notloaded",'Module name "'+n+'" has not been loaded yet for context: '+b+(a?"":". Use require([])"))):r[n]}J();i.nextTick(function(){J();q=s(p(null,a));q.skipMap=e.skipMap;q.init(c,d,m,{enabled:!0});D()});return j}e=e||{};U(j,{isBrowser:z,toUrl:function(b){var d,e=b.lastIndexOf("."),k=b.split("/")[0];if(-1!==
e&&(!("."===k||".."===k)||1<e))d=b.substring(e,b.length),b=b.substring(0,e);return i.nameToUrl(c(b,a&&a.id,!0),d,!0)},defined:function(b){return t(r,p(b,a,!1,!0).id)},specified:function(b){b=p(b,a,!1,!0).id;return t(r,b)||t(h,b)}});a||(j.undef=function(b){x();var c=p(b,a,!0),e=m(h,b);d(b);delete r[b];delete S[c.url];delete $[b];T(A,function(a,c){a[0]===b&&A.splice(c,1)});e&&(e.events.defined&&($[b]=e.events),y(b))});return j},enable:function(a){m(h,a.id)&&s(a).enable()},completeLoad:function(a){var b,
c,d=m(j.shim,a)||{},g=d.exports;for(x();A.length;){c=A.shift();if(null===c[0]){c[0]=a;if(b)break;b=!0}else c[0]===a&&(b=!0);E(c)}c=m(h,a);if(!b&&!t(r,a)&&c&&!c.inited){if(j.enforceDefine&&(!g||!da(g)))return e(a)?void 0:w(C("nodefine","No define call for "+a,null,[a]));E([a,d.deps||[],d.exportsFn])}D()},nameToUrl:function(a,b,c){var d,e,h;(d=m(j.pkgs,a))&&(a=d);if(d=m(aa,a))return i.nameToUrl(d,b,c);if(g.jsExtRegExp.test(a))d=a+(b||"");else{d=j.paths;a=a.split("/");for(e=a.length;0<e;e-=1)if(h=a.slice(0,
e).join("/"),h=m(d,h)){H(h)&&(h=h[0]);a.splice(0,e,h);break}d=a.join("/");d+=b||(/^data\:|\?/.test(d)||c?"":".js");d=("/"===d.charAt(0)||d.match(/^[\w\+\.\-]+:/)?"":j.baseUrl)+d}return j.urlArgs?d+((-1===d.indexOf("?")?"?":"&")+j.urlArgs):d},load:function(a,b){g.load(i,a,b)},execCb:function(a,b,c,d){return b.apply(d,c)},onScriptLoad:function(a){if("load"===a.type||ja.test((a.currentTarget||a.srcElement).readyState))N=null,a=I(a),i.completeLoad(a.id)},onScriptError:function(a){var b=I(a);if(!e(b.id))return w(C("scripterror",
"Script error for: "+b.id,a,[b.id]))}};i.require=i.makeRequire();return i}var g,x,y,D,I,E,N,J,s,O,ka=/(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg,la=/[^.]\s*require\s*\(\s*["']([^'"\s]+)["']\s*\)/g,Q=/\.js$/,ia=/^\.\//;x=Object.prototype;var K=x.toString,fa=x.hasOwnProperty,ha=Array.prototype.splice,z=!!("undefined"!==typeof window&&"undefined"!==typeof navigator&&window.document),ea=!z&&"undefined"!==typeof importScripts,ja=z&&"PLAYSTATION 3"===navigator.platform?/^complete$/:/^(complete|loaded)$/,
Y="undefined"!==typeof opera&&"[object Opera]"===opera.toString(),F={},q={},R=[],M=!1;if("undefined"===typeof define){if("undefined"!==typeof requirejs){if(G(requirejs))return;q=requirejs;requirejs=void 0}"undefined"!==typeof require&&!G(require)&&(q=require,require=void 0);g=requirejs=function(b,c,d,e){var n,p="_";!H(b)&&"string"!==typeof b&&(n=b,H(c)?(b=c,c=d,d=e):b=[]);n&&n.context&&(p=n.context);(e=m(F,p))||(e=F[p]=g.s.newContext(p));n&&e.configure(n);return e.require(b,c,d)};g.config=function(b){return g(b)};
g.nextTick="undefined"!==typeof setTimeout?function(b){setTimeout(b,4)}:function(b){b()};require||(require=g);g.version="2.1.14";g.jsExtRegExp=/^\/|:|\?|\.js$/;g.isBrowser=z;x=g.s={contexts:F,newContext:ga};g({});v(["toUrl","undef","defined","specified"],function(b){g[b]=function(){var c=F._;return c.require[b].apply(c,arguments)}});if(z&&(y=x.head=document.getElementsByTagName("head")[0],D=document.getElementsByTagName("base")[0]))y=x.head=D.parentNode;g.onError=ca;g.createNode=function(b){var c=
b.xhtml?document.createElementNS("http://www.w3.org/1999/xhtml","html:script"):document.createElement("script");c.type=b.scriptType||"text/javascript";c.charset="utf-8";c.async=!0;return c};g.load=function(b,c,d){var e=b&&b.config||{};if(z)return e=g.createNode(e,c,d),e.setAttribute("data-requirecontext",b.contextName),e.setAttribute("data-requiremodule",c),e.attachEvent&&!(e.attachEvent.toString&&0>e.attachEvent.toString().indexOf("[native code"))&&!Y?(M=!0,e.attachEvent("onreadystatechange",b.onScriptLoad)):
(e.addEventListener("load",b.onScriptLoad,!1),e.addEventListener("error",b.onScriptError,!1)),e.src=d,J=e,D?y.insertBefore(e,D):y.appendChild(e),J=null,e;if(ea)try{importScripts(d),b.completeLoad(c)}catch(m){b.onError(C("importscripts","importScripts failed for "+c+" at "+d,m,[c]))}};z&&!q.skipDataMain&&T(document.getElementsByTagName("script"),function(b){y||(y=b.parentNode);if(I=b.getAttribute("data-main"))return s=I,q.baseUrl||(E=s.split("/"),s=E.pop(),O=E.length?E.join("/")+"/":"./",q.baseUrl=
O),s=s.replace(Q,""),g.jsExtRegExp.test(s)&&(s=I),q.deps=q.deps?q.deps.concat(s):[s],!0});define=function(b,c,d){var e,g;"string"!==typeof b&&(d=c,c=b,b=null);H(c)||(d=c,c=null);!c&&G(d)&&(c=[],d.length&&(d.toString().replace(ka,"").replace(la,function(b,d){c.push(d)}),c=(1===d.length?["require"]:["require","exports","module"]).concat(c)));if(M){if(!(e=J))N&&"interactive"===N.readyState||T(document.getElementsByTagName("script"),function(b){if("interactive"===b.readyState)return N=b}),e=N;e&&(b||
(b=e.getAttribute("data-requiremodule")),g=F[e.getAttribute("data-requirecontext")])}(g?g.defQueue:R).push([b,c,d])};define.amd={jQuery:!0};g.exec=function(b){return eval(b)};g(q)}})(this);