/*
Entry component
===============
This component provides the UI for the overview pages
and implements all handlers for actions like editing 
and viewing.
*/

/// <reference path="../vendor/mithril.d.ts" />

define(function(require) {
    
var m  = require('../vendor/mithril'),
    l  = require('../localization/localized'),
button = require('../subcomponents/button');

// should be augmented with markup
return function(entry, index) {
    var edit = function() {
        m.route("edit/" + index);
    };

    return m('div', [
        m('span', entry.title),
        button({
            onclick: edit,
            label: l.edit
        })
    ]);
};

});
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
/* 
Mediator
========
*/

define(function(require) {

require('../helpers/bind');

var Mediator = function() {
    
	var subscriptions = {}; // private variable
    
    /* publishes an event */
    this.pub = function(event/*::string*/ /*, additional information*/) {
    	var additionalInformation = Array.prototype.slice.call(arguments, 1);
        if(subscriptions[event]) {
            subscriptions[event].forEach(function(func) {
                func.apply(this, additionalInformation);
            });
        }
        // Debugging:
        console.log("Event " + event + " was published with data: " +
                    Array.prototype.slice.call(arguments, 1));
    };
    
    // Currying of *pub* for use as a callback
    this.publishing = function(/*arguments*/) {
    	// store for use in returned function
    	var myArguments = arguments;
    	return function() {
        	this.pub.apply(this, myArguments);
        }.bind(this);
    }.bind(this);
    
    // subscribe to an event
    this.on = function(event, callback) {
    	// initialize subscriptions for the event
    	subscriptions[event] = subscriptions[event] || [];
        subscriptions[event].push(callback);
    };
    
    // Reset to original state
    this.reset = function() {
    	subscriptions = {};
    };
};

var _md = undefined;

// Mediator singleton
return function() {
	if(_md) {
    	return _md;
    } else {
    	return _md = new Mediator();
    }
}

});
/*
Autofill module
===============

This module provides all functionality for
the autofilling feature.
It contains a function which autofills and 
autosubmits a given form.
*/

define(function() {


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
 
/* Returns a form element, which has all given information
   already filled in. It can then be submitted directly.
*/
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

define(function() {
    // Mutates *base*
    return function(base, copying) {
        for(var key in copying) {
            base[key] = copying[key];
        };
    };
});
/*
Extend helper
============

Extends a given javascript object with another one,
without mutating it. It returns the extended version;
*/

define(['./copying'], function(copy) {
	return function(base/*::{}*/, extension/*::{}*/)/*::{}*/ {
    	var result = {};
        copy(result, base);
        copy(result, extension);
        return result;
    };
});
/*~ Function.prototype.reduce polyfill */

if ( 'function' !== typeof Array.prototype.reduce ) {
  Array.prototype.reduce = function( callback /*, initialValue*/ ) {
    'use strict';
    if ( null === this || 'undefined' === typeof this ) {
      throw new TypeError(
         'Array.prototype.reduce called on null or undefined' );
    }
    if ( 'function' !== typeof callback ) {
      throw new TypeError( callback + ' is not a function' );
    }
    var t = Object( this ), len = t.length >>> 0, k = 0, value;
    if ( arguments.length >= 2 ) {
      value = arguments[1];
    } else {
      while ( k < len && ! k in t ) k++; 
      if ( k >= len )
        throw new TypeError('Reduce of empty array with no initial value');
      value = t[ k++ ];
    }
    for ( ; k < len ; k++ ) {
      if ( k in t ) {
         value = callback( value, t[k], k, t );
      }
    }
    return value;
  };
}
/*
Request helper
==============
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

define(['../helpers/bind'], function() {

    // Helper function which returns the URL encoding of
    // the object.
    var toURLEncoding = function(obj/*::{}*/)/*::string*/ {
        return Object.keys(obj).map(function (prop) {
            return encodeURIComponent(prop) + "="
                 + encodeURIComponent(obj[prop]);
        }).join("&");
    };
    
    Request = function(config/*::RequestConfig*/) {
        this.handlers = {};
        this.defaultHandler = undefined;
        
        var isGetRequest = config.method.toLowerCase() == "get";
        
        var encodedData = toURLEncoding(config.data);
        
        var url = config.url + (isGetRequest ? "?" + encodedData : "");
                                
        var payload = isGetRequest ? "" : encodedData;
        
        var request = new XMLHttpRequest();
        
        request.onload = function() {
        	if(this.handlers[request.status]) {
            	// call the corresponding handler with the response
            	this.handlers[request.status](request.responseText);
            } // there is no specific handler for this status code
            else {
            	if(this.defaultHandler) {
                	this.defaultHandler(request.responseText);
                } else { // unhandled error
                	throw new Error("Error during request for: " + url +
                    	" with data: " + JSON.stringify(config.data));
                }
            }
        }.bind(this);
        
		request.open(config.method, url);
		request.setRequestHeader('Content-Type',
        		'application/x-www-form-urlencoded; charset=UTF-8');
     	request.send(payload);
    };
    
    Request.prototype.onStatus = function(status/*::number*/, callback) {
    	this.handlers[status] = callback;
        return this;
    };
    
    Request.prototype.otherwise = function(callback) {
    	this.defaultHandler = callback;
        return this;
    };
    
    return Request;
});
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
define(['../helpers/bind', '../helpers/reduce_polyfill',
		'../helpers/extend',
		'json!./main.json', 'json!./generator.json',
        'json!./login.json', 'json!./errorMessages.json',
        'json!./entry.json', 'json!./edit.json',
        'json!./overview.json',
        'json!./register.json'],
       function(__, __, extend, main, generator, login,
                errorMessages, entry, edit, overview,
                register) {
	

/*function(require) {

var __ = require('../helpers/bind'),
__ = require('../helpers/reduce_polyfill'),
main = require('json!./main.json');*/



var localizations = Array.prototy.slice.call(arguments, 3);

/*var localizations = [main, generator, login,
      errorMessages, entry, edit, overview, register];*/

var locale = (navigator.language || navigator.userLanguage).substring(0, 2);

// Combine all localizations into one object
var localized = localizations.reduce(function(acc, addition) {
	return extend(acc, addition[locale]);
}, {});

return localized;

});
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
require.config({
	paths: {
        'text': '../vendor/requirejs_plugins/text',
        'json': '../vendor/requirejs_plugins/json'
    }
});

define(['./routes'], function() {});
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

define(function(require) {

var m = require('../vendor/mithril'),
login = require('../pages/login'),
edit  = require('../pages/edit'),
generator = require('../pages/generator'),
overview  = require('../pages/overview'),
register  = require('../pages/register'),
_ = require('../model/transitions');

setTimeout(function() {
    m.route(document.body, "", {
   		"": login,
        "overview":overview,
        "edit/:entryId": edit,
        "generator": generator,
        // "autofill":
        "register": register
    }); 
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

define(['../framework/mediator', '../helpers/request'],
       function(md, Request) {

    // exposed with a public setter, so that it can
    // be mocked for tests
    var API_BASE_URL = "https://safify-api.herokuapp.com/";
    
    function set_API_BASE_URL(url/*::string*/) {
    	API_BASE_URL = url;
    }

    // This private function returns the url for
    // a specific path of the API
    var API_URL = function (path/*::string*/)/*::string*/ {
        // important: use https:// protocol
        return API_BASE_URL + path;
    };

    /*~
    For ajax-requests we intentionally don't use the
    mithril-API since it requires actually more code
    and requires the developer to understand the mithril-API
    in detail. We therefore use the standard
    XMLHttpRequest-object which makes this approach
    also portable to other frameworks.
    */
    // The function uses the API endpoint '/passwords'.
    
    function retrieveData(username/*::string*/,
    		  password/*::string*/)/*::Request*/ {
        return new Request({
        	method: "GET",
            url: API_URL('passwords'),
            data: {
            	"username": username,
            	"password": password
            }
        }).onStatus(200, function(response) {
        	md().pub('dataReceived', response)
        }).onStatus(401, md().publishing('authentificationFailed'))
        .onStatus(403, md().publishing('usernameNotFound'));
    };
    
    // This function reqisters a user on the server
    // (via the endpoin '/register').
    function registerUser(username/*::string*/,
    				      password/*::string*/)/*::Request*/ {
    	return new Request({
        	method: "POST",
            url: API_URL("register"),
            data: {
            	"username": username,
                "password": password
            }
        }).onStatus(201, md().publishing('loggedIn'))
        .onStatus(409, md().publishing('usernameUsed'))
        .otherwise(md().publishing('networkError'));
    };

    // Changes the password for authentification on the server
    // to a new one.
    // username: string
    // oldPassword: string   password used before
    // newPassword: string
    // callback: function    triggered when the request completes
    function changeServerPassword(username/*::string*/,  oldPassword/*::string*/,
              newPassword/*::string*/)/*::MithrilPromise*/ {
              
        return new Request({
        	method: 'POST',
            url: API_URL('change_password'),
            data: {
            	'username': username,
                'password': oldPassword,
                'new_password': newPassword
            }
        }).onStatus(201, md().publishing('passwordSaved'))
        .otherwise(md().publishing('networkError'));      
    };
    
    function savePasswordList(username/*::string*/, password/*::string*/,
    		  data/*::string*/)/*::MithrilPromise*/ { 
              
        return new Request({
        	method: 'POST',
            url: API_URL('passwords'),
            data: {
            	'username': username,
                'password': password,
                'password_list': data
            }
        }).onStatus(201, md().publishing('saved'))
        .otherwise(md().publishing('networkError'));
    };

	return {
    	set_API_BASE_URL: set_API_BASE_URL,
        retrieveData: retrieveData,
        registerUser: registerUser,
        changeServerPassword: changeServerPassword,
        savePasswordList: savePasswordList
    };
});
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
Entry class
===========

Represents an entry and provides utility methods for it
so that the attributes are mithril-Properties for direct
access with input fields.
*/

define(function(require) {

var m = require('../vendor/mithril');
	
var Entry = function(blueprint/*::{}?*/) {
    // initialize attributes
    blueprint = blueprint || {};
    this.title    = m.prop(blueprint.title || "");
    this.username = m.prop(blueprint.username || "");
    this.password = m.prop(blueprint.password || "");
}

Entry.prototype.serialize = function() {
    return {
        title: this.title(),
        username: this.username(),
        password: this.password()
    };
};

// // static function
// Entry.deserialize = function(entry)/*::Entry*/ {
//     return new Entry(entry);
// }

return Entry;

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

define(['../vendor/sjcl'], function(sjcl) {
    
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
    
    var clientPasswordMemo;
    // We have to check if username or password have
    // changed, in this case, the client password
    // *has* to be recomputed.
    var oldUsername;
    var oldPassword;
    
    function clientPassword(username/*::string*/,
    							password/*::string*/)/*::string*/ {
        
        // When the value is already computed, (with
        // the same username and password), return
        // it immediately and stop the computation.
        if (clientPasswordMemo && username === oldUsername &&
            password === oldPassword) {
            return clientPasswordMemo;
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
        return clientPasswordMemo = JSON.stringify(
            sjcl.misc.pbkdf2(password, salt, iterations)
        );
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
    var serverPasswordMemo;
    var oldUsername;
    var oldPassword;
    
    
   function serverPassword(username/*::string*/,
    							password/*::string*/)/*::string*/ {
        if(serverPasswordMemo && username == oldUsername
           && password == oldPassword) {
            return serverPasswordMemo;
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
                    
 		return serverPasswordMemo = JSON.stringify(
        	sjcl.misc.pbkdf2(password, salt, iterations)
      	);
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
    
    function encrypt(username/*::string*/,
                         password/*::string*/,
                         data/*::string*/)/*::sjcl.SjclCipherEncrypted*/ {
        var key = clientPassword(username, password);
        return sjcl.encrypt(key, data);
    };
    
    function decrypt(username/*::string*/,
                         password/*::string*/,
                         data/*::sjcl.SjclCipherEncrypted*/)/*::string*/ {
    	var key = clientPassword(username, password);
        return sjcl.decrypt(key, data);
    };
    
    return {
    	serverPassword: serverPassword,
        clientPassword: clientPassword,
        encrypt: encrypt,
        decrypt: decrypt
    };
    
});
define(function(require) {

var md = require('../framework/mediator'),
     m = require('../vendor/mithril');

md().on('loggedIn', function() {
	m.route('overview');
});

});
/*
User module
===========

This module provides all functionality related
to the user login, registration and password
changing functionality. (It manages as well
the password list.)

The user is implemented as a singleton object.

*/


define(function(require) {

var md   = require('../framework/mediator'),
api      = require('../model/api'),
security = require('../model/security');
	
var _username = undefined;
var _password = undefined;
var entries = [];

function save() {
	var serverPassword = security.serverPassword(_username, _password);
    var encryptedData = security.encrypt(_username,
    							  _password,
                                  JSON.stringify(entries));
	api.savePasswordList(_username, serverPassword, encryptedData);
}

md().on('login', function(username, password) {
    /* Since we do an asynchronous call and want to show (in case)
       all error messages, we have to signalize Mithril the start
       of an asynchronous call. This is later resolved in the 
       errorMessages - module with m.endComputation, such that a
       redraw is triggered. In the case of no existing error messages
       we signalize the end with m.endComputation inside dataReceived
    */
    m.startComputation();
    
	_username = username; _password = password;
	var serverPassword = security.serverPassword(_username, _password);
	api.retrieveData(username, serverPassword);
});

md().on('register', function(username, password) {
	_username = username; _password = password;
	var serverPassword = security.serverPassword(_username, _password);
    api.registerUser(_username, serverPassword);
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
    var decrypted = security.decrypt(_username, _password, data);
    entries = JSON.parse(decrypted);
    md().pub('loggedIn');
    m.endComputation();
});

return {
    getEntries: function() { return entries; }
};
    
});


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

define(function(require) {

var m  = require('../vendor/mithril'),
   md  = require('../framework/mediator')
    l  = require('../localization/localized'),
input  = require('../subcomponents/input'),
button = require('../subcomponents/button'),
user   = require('../model/user'),
PropertyEntry  = require('../model/propertyEntry');
	
function controller() {
    this.entryId = m.route.param("entryId");

    this.entry = new PropertyEntry(user.getEntries()[this.entryId]);

    this.saveEntry = function() {
        md().pub('changeEntry', this.entryId, this.entry.serialize());
        m.route('overview');   
    }.bind(this);

    // TODO: Change this into displaying a confirmation
    // dialog first
    //this.deleteEntry = user.deleteEntry.bind(this, index);
};

function view(ctrl) {
    return m('div', [
        input({
            type: 'text',
            label: l.title,
            value: ctrl.entry.title
        }),
        input({
            type: 'text',
            label: l.username,
            value: ctrl.entry.username
        }),
        input({
            type: 'text',
            label: l.password,
            value: ctrl.entry.password
        }),
        button({
            onclick: ctrl.saveEntry,
            label: l.save,
            callToAction: true
        }),
        button({
            label: l.delete,
            onclick: ctrl.deleteEntry,
            classes: ['danger']
        })
    ]);
};

return {
	controller: controller,
    view: view
};

});
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

define(function(require) {

var m    = require('../vendor/mithril'),
l        = require('../localization/localized'),
range    = require('../subcomponents/range'),
button   = require('../subcomponents/button'),
checkbox = require('../subcomponents/checkbox'),
generatePassword = require('../model/generator');


function controller() {

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
        return password = generatePassword(
            this.length(),
            this.useUppercase(),
            this.useNumbers(),
            this.useSpecialCharacters()
        );
    };
    
    // Regenerates a password by simply issuing a
    // redraw of the view
    this.regenerate = m.redraw;

    /* Creates an entry with the current generated
       password.
    */
    this.createEntryWithPassword = function() {
        // TODO
    }
};

function view(ctrl) {
    return m("div", [
        m("span", ctrl.password()),
        range({
            value: ctrl.length,
            min: 4,
            max: 16,
            label: l.length
        }),
        checkbox({ label: l.uppercase, checked: ctrl.useUppercase }),
        checkbox({ label: l.numbers, checked: ctrl.useNumbers }),
        checkbox({ label: l.specialCharacters, 
          checked: ctrl.useSpecialCharacters
        }),
        button({
        	onclick: ctrl.regenerate,
            label: l.regenerate
        }),
        button({
            onclick: ctrl.createEntryWithPassword,
            label: l.create_entry_with_generated_password
        })
    ]);    
};

return {
	controller: controller,
    view: view
};

});
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

    this.login = function(event) {
        md().pub('login', this.username(), this.password());
        
        /*.subscribe('logged_in', function() { m.route('overview'); })
        .subscribe('authentification_failed', this.authentificationFailed)
        .subscribe('username_not_found', this.usernameNotFound)
        .subscribe('other_error', this.networkError)*/
    }.bind(this);        

    // Redirect to the generator page
    this.toGenerator = function() { m.route('generator'); };

    this.toRegistration = function() { m.route('register'); };
};


// TODO: augment the markup
function view(ctrl) {
    return m('div', [
        errorMessages(),
        m('form', [
            input({
                value: ctrl.username,
                label: l.username,
                type: 'text',
                autofocus: true
            }),
            input({
                value: ctrl.password,
                label: l.password,
                type: 'password'
            }),
            button({
                onclick: ctrl.login,
                label: l.login,
                callToAction: true,
                submit: true
            })
        ]),
        
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

define(function(require) {

var m          = require('../vendor/mithril'),
    l          = require('../localization/localized'),
entryComponent = require('../components/entry'),
user           = require('../model/user'),
button        = require('../subcomponents/button');
    
function controller() {

};

function view(ctrl) {
    return m('div', [
        m('div', user.getEntries().map(function(entry, index) {
            return entryComponent(entry, index);
        })),
        button({
            onclick: function() { m.route('/new') },
            callToAction: true,
            label: l.newEntry
        })
    ]);
};
    
return {
	controller: controller,
    view: view
};

});
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
/*
Button subcomponent
===================

This component is a simple topcoat button,
with an attached clicked handler.
*/

define(['../vendor/mithril'], function(m) {
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
//   // whether this is is an input-submit button for a form
//   submit: bool
// }
return function(config) {
    var classes = "topcoat-button" + (config.large ? "--large" : "") +
                (config.callToAction ? "--cta" : "") +
                (config.quiet ? "--quiet": "") +
                " " + (config.classes || "");
                
    
    return config.submit ?
        m("input[type=submit]", {
            "class": classes,
            value: config.label,
            /* We can use the "onclick" event handler since
               somehow it is also activated, when the form
               is submitted by pressing the enter key.
            */
            onclick: function() {
                config.onclick();
                event.preventDefault();
            }
        }) :
    
        m("button", {
            "class": classes,
            onclick: config.onclick
        }, config.label);
};
});
/*
Checkbox subcomponent
=====================

The checkbox subcomponent represents
the controller and view for a topcoat-
styled checkbox
*/

define(['../vendor/mithril'], function(m) {
    
// *config.checked* is a m.prop property which is 
// then bound to the checkbox
// *config.label* is the string which is shown next
// to the checkbox
    
return function(config) {
    return m("label.topcoat-checkbox", [
        m("input[type=checkbox]", {
            onchange: m.withAttr("checked", config.checked),
            checked: config.checked()
        }),
        m("div.topcoat-checkbox__checkmark"),
        config.label
    ]);
};

});

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
    autofocus: bool
}
*/

define(['../vendor/mithril'], function(m) {

return function(config/*::InputOptions*/) /*::MithrilVirtualElement*/ {
    return m('label', [
        m('input', {
            type: config.type,
            value: config.value(),
            onchange: m.withAttr('value', config.value),
            placeholder: config.label,
            autofocus: config.autofocus
        }),
        config.label
    ]);
};
    
});
(function() {
	namespace('s');

	s.modal = function(config, contents) {
    	return m('div.modal', contents);
    }
    
}());
/*
Input range subcomponent
========================

This subcompoenent represents a topcoat range input,
together with a display of the current value.

*/

/// <reference path="../vendor/mithril.d.ts" />

define(['../vendor/mithril'], function(m) {

    // config: {
    // 	   label: string,
    //	   value: m.prop,
    //     min:   int,
    //     max:   int
	// }    
    return function(config) {
    	return m("label", [
            m("input[type=range].topcoat-range", {
                min: config.min,
                max: config.max,
                value: config.value(),
                onchange: m.withAttr("value", config.value)
            }),
            config.label
        ]);
    };
});
Mithril = m = new function app(window) {
	var type = {}.toString
	var parser = /(?:(^|#|\.)([^#\.\[\]]+))|(\[.+?\])/g, attrParser = /\[(.+?)(?:=("|'|)(.*?)\2)?\]/
	
	function m() {
		var args = arguments
		var hasAttrs = type.call(args[1]) == "[object Object]" && !("tag" in args[1]) && !("subtree" in args[1])
		var attrs = hasAttrs ? args[1] : {}
		var classAttrName = "class" in attrs ? "class" : "className"
		var cell = {tag: "div", attrs: {}}
		var match, classes = []
		while (match = parser.exec(args[0])) {
			if (match[1] == "") cell.tag = match[2]
			else if (match[1] == "#") cell.attrs.id = match[2]
			else if (match[1] == ".") classes.push(match[2])
			else if (match[3][0] == "[") {
				var pair = attrParser.exec(match[3])
				cell.attrs[pair[1]] = pair[3] || (pair[2] ? "" :true)
			}
		}
		if (classes.length > 0) cell.attrs[classAttrName] = classes.join(" ")
		
		cell.children = hasAttrs ? args[2] : args[1]
		
		for (var attrName in attrs) {
			if (attrName == classAttrName) cell.attrs[attrName] = (cell.attrs[attrName] || "") + " " + attrs[attrName]
			else cell.attrs[attrName] = attrs[attrName]
		}
		return cell
	}
	function build(parentElement, parentTag, parentCache, parentIndex, data, cached, shouldReattach, index, editable, namespace, configs) {
		if (data === null || data === undefined) data = ""
		if (data.subtree === "retain") return cached

		var cachedType = type.call(cached), dataType = type.call(data)
		if (cachedType != dataType) {
			if (cached !== null && cached !== undefined) {
				if (parentCache && parentCache.nodes) {
					var offset = index - parentIndex
					var end = offset + (dataType == "[object Array]" ? data : cached.nodes).length
					clear(parentCache.nodes.slice(offset, end), parentCache.slice(offset, end))
				}
				else clear(cached.nodes, cached)
			}
			cached = new data.constructor
			cached.nodes = []
		}

		if (dataType == "[object Array]") {
			data = flatten(data)
			var nodes = [], intact = cached.length === data.length, subArrayCount = 0
			
			var DELETION = 1, INSERTION = 2 , MOVE = 3
			var existing = {}, unkeyed = [], shouldMaintainIdentities = false
			for (var i = 0; i < cached.length; i++) {
				if (cached[i] && cached[i].attrs && cached[i].attrs.key !== undefined) {
					shouldMaintainIdentities = true
					existing[cached[i].attrs.key] = {action: DELETION, index: i}
				}
			}
			if (shouldMaintainIdentities) {
				for (var i = 0; i < data.length; i++) {
					if (data[i] && data[i].attrs) {
						if (data[i].attrs.key !== undefined) {
							var key = data[i].attrs.key
							if (!existing[key]) existing[key] = {action: INSERTION, index: i}
							else existing[key] = {action: MOVE, index: i, from: existing[key].index, element: parentElement.childNodes[existing[key].index]}
						}
						else unkeyed.push({index: i, element: parentElement.childNodes[i]})
					}
				}
				var actions = Object.keys(existing).map(function(key) {return existing[key]})
				var changes = actions.sort(function(a, b) {return a.action - b.action || a.index - b.index})
				var newCached = cached.slice()
				
				for (var i = 0, change; change = changes[i]; i++) {
					if (change.action == DELETION) {
						clear(cached[change.index].nodes, cached[change.index])
						newCached.splice(change.index, 1)
					}
					if (change.action == INSERTION) {
						var dummy = window.document.createElement("div")
						dummy.key = data[change.index].attrs.key
						parentElement.insertBefore(dummy, parentElement.childNodes[change.index])
						newCached.splice(change.index, 0, {attrs: {key: data[change.index].attrs.key}, nodes: [dummy]})
					}
					
					if (change.action == MOVE) {
						if (parentElement.childNodes[change.index] !== change.element) {
							parentElement.insertBefore(change.element, parentElement.childNodes[change.index])
						}
						newCached[change.index] = cached[change.from]
					}
				}
				for (var i = 0; i < unkeyed.length; i++) {
					var change = unkeyed[i]
					parentElement.insertBefore(change.element, parentElement.childNodes[change.index])
					newCached[change.index] = cached[change.index]
				}
				cached = newCached
				cached.nodes = []
				for (var i = 0, child; child = parentElement.childNodes[i]; i++) cached.nodes.push(child)
			}
			
			for (var i = 0, cacheCount = 0; i < data.length; i++) {
				var item = build(parentElement, parentTag, cached, index, data[i], cached[cacheCount], shouldReattach, index + subArrayCount || subArrayCount, editable, namespace, configs)
				if (item === undefined) continue
				if (!item.nodes.intact) intact = false
				var isArray = item instanceof Array
				subArrayCount += isArray ? item.length : 1
				cached[cacheCount++] = item
			}
			if (!intact) {
				for (var i = 0; i < data.length; i++) {
					if (cached[i] !== undefined) nodes = nodes.concat(cached[i].nodes)
				}
				for (var i = 0, node; node = cached.nodes[i]; i++) {
					if (node.parentNode !== null && nodes.indexOf(node) < 0) node.parentNode.removeChild(node)
				}
				for (var i = cached.nodes.length, node; node = nodes[i]; i++) {
					if (node.parentNode === null) parentElement.appendChild(node)
				}
				if (data.length < cached.length) cached.length = data.length
				cached.nodes = nodes
			}
			
		}
		else if (dataType == "[object Object]") {
			if (data.tag != cached.tag || Object.keys(data.attrs).join() != Object.keys(cached.attrs).join() || data.attrs.id != cached.attrs.id) {
				clear(cached.nodes)
				if (cached.configContext && typeof cached.configContext.onunload == "function") cached.configContext.onunload()
			}
			if (typeof data.tag != "string") return

			var node, isNew = cached.nodes.length === 0
			if (data.attrs.xmlns) namespace = data.attrs.xmlns
			else if (data.tag === "svg") namespace = "http://www.w3.org/2000/svg"
			if (isNew) {
				node = namespace === undefined ? window.document.createElement(data.tag) : window.document.createElementNS(namespace, data.tag)
				cached = {
					tag: data.tag,
					//process children before attrs so that select.value works correctly
					children: data.children !== undefined ? build(node, data.tag, undefined, undefined, data.children, cached.children, true, 0, data.attrs.contenteditable ? node : editable, namespace, configs) : undefined,
					attrs: setAttributes(node, data.tag, data.attrs, {}, namespace),
					nodes: [node]
				}
				parentElement.insertBefore(node, parentElement.childNodes[index] || null)
			}
			else {
				node = cached.nodes[0]
				setAttributes(node, data.tag, data.attrs, cached.attrs, namespace)
				cached.children = build(node, data.tag, undefined, undefined, data.children, cached.children, false, 0, data.attrs.contenteditable ? node : editable, namespace, configs)
				cached.nodes.intact = true
				if (shouldReattach === true) parentElement.insertBefore(node, parentElement.childNodes[index] || null)
			}
			if (type.call(data.attrs["config"]) == "[object Function]") {
				configs.push(data.attrs["config"].bind(window, node, !isNew, cached.configContext = cached.configContext || {}, cached))
			}
		}
		else {
			var nodes
			if (cached.nodes.length === 0) {
				if (data.$trusted) {
					nodes = injectHTML(parentElement, index, data)
				}
				else {
					nodes = [window.document.createTextNode(data)]
					parentElement.insertBefore(nodes[0], parentElement.childNodes[index] || null)
				}
				cached = "string number boolean".indexOf(typeof data) > -1 ? new data.constructor(data) : data
				cached.nodes = nodes
			}
			else if (cached.valueOf() !== data.valueOf() || shouldReattach === true) {
				nodes = cached.nodes
				if (!editable || editable !== window.document.activeElement) {
					if (data.$trusted) {
						clear(nodes, cached)
						nodes = injectHTML(parentElement, index, data)
					}
					else {
						if (parentTag === "textarea") parentElement.value = data
						else if (editable) editable.innerHTML = data
						else {
							if (nodes[0].nodeType == 1 || nodes.length > 1) { //was a trusted string
								clear(cached.nodes, cached)
								nodes = [window.document.createTextNode(data)]
							}
							parentElement.insertBefore(nodes[0], parentElement.childNodes[index] || null)
							nodes[0].nodeValue = data
						}
					}
				}
				cached = new data.constructor(data)
				cached.nodes = nodes
			}
			else cached.nodes.intact = true
		}

		return cached
	}
	function setAttributes(node, tag, dataAttrs, cachedAttrs, namespace) {
		var groups = {}
		for (var attrName in dataAttrs) {
			var dataAttr = dataAttrs[attrName]
			var cachedAttr = cachedAttrs[attrName]
			if (!(attrName in cachedAttrs) || (cachedAttr !== dataAttr) || node === window.document.activeElement) {
				cachedAttrs[attrName] = dataAttr
				if (attrName === "config") continue
				else if (typeof dataAttr == "function" && attrName.indexOf("on") == 0) {
					node[attrName] = autoredraw(dataAttr, node)
				}
				else if (attrName === "style" && typeof dataAttr == "object") {
					for (var rule in dataAttr) {
						if (cachedAttr === undefined || cachedAttr[rule] !== dataAttr[rule]) node.style[rule] = dataAttr[rule]
					}
					for (var rule in cachedAttr) {
						if (!(rule in dataAttr)) node.style[rule] = ""
					}
				}
				else if (namespace !== undefined) {
					if (attrName === "href") node.setAttributeNS("http://www.w3.org/1999/xlink", "href", dataAttr)
					else if (attrName === "className") node.setAttribute("class", dataAttr)
					else node.setAttribute(attrName, dataAttr)
				}
				else if (attrName === "value" && tag === "input") {
					if (node.value !== dataAttr) node.value = dataAttr
				}
				else if (attrName in node && !(attrName == "list" || attrName == "style")) {
					node[attrName] = dataAttr
				}
				else node.setAttribute(attrName, dataAttr)
			}
		}
		return cachedAttrs
	}
	function clear(nodes, cached) {
		for (var i = nodes.length - 1; i > -1; i--) {
			if (nodes[i] && nodes[i].parentNode) {
				nodes[i].parentNode.removeChild(nodes[i])
				cached = [].concat(cached)
				if (cached[i]) unload(cached[i])
			}
		}
		if (nodes.length != 0) nodes.length = 0
	}
	function unload(cached) {
		if (cached.configContext && typeof cached.configContext.onunload == "function") cached.configContext.onunload()
		if (cached.children) {
			if (cached.children instanceof Array) for (var i = 0; i < cached.children.length; i++) unload(cached.children[i])
			else if (cached.children.tag) unload(cached.children)
		}
	}
	function injectHTML(parentElement, index, data) {
		var nextSibling = parentElement.childNodes[index]
		if (nextSibling) {
			var isElement = nextSibling.nodeType != 1
			var placeholder = window.document.createElement("span")
			if (isElement) {
				parentElement.insertBefore(placeholder, nextSibling)
				placeholder.insertAdjacentHTML("beforebegin", data)
				parentElement.removeChild(placeholder)
			}
			else nextSibling.insertAdjacentHTML("beforebegin", data)
		}
		else parentElement.insertAdjacentHTML("beforeend", data)
		var nodes = []
		while (parentElement.childNodes[index] !== nextSibling) {
			nodes.push(parentElement.childNodes[index])
			index++
		}
		return nodes
	}
	function flatten(data) {
		var flattened = []
		for (var i = 0; i < data.length; i++) {
			var item = data[i]
			if (item instanceof Array) flattened.push.apply(flattened, flatten(item))
			else flattened.push(item)
		}
		return flattened
	}
	function autoredraw(callback, object, group) {
		return function(e) {
			e = e || event
			m.startComputation()
			try {return callback.call(object, e)}
			finally {
				if (!lastRedrawId) lastRedrawId = -1;
				m.endComputation()
			}
		}
	}

	var html
	var documentNode = {
		insertAdjacentHTML: function(_, data) {
			window.document.write(data)
			window.document.close()
		},
		appendChild: function(node) {
			if (html === undefined) html = window.document.createElement("html")
			if (node.nodeName == "HTML") html = node
			else html.appendChild(node)
			if (window.document.documentElement && window.document.documentElement !== html) {
				window.document.replaceChild(html, window.document.documentElement)
			}
			else window.document.appendChild(html)
		},
		insertBefore: function(node) {
			this.appendChild(node)
		},
		childNodes: []
	}
	var nodeCache = [], cellCache = {}
	m.render = function(root, cell) {
		var configs = []
		if (!root) throw new Error("Please ensure the DOM element exists before rendering a template into it.")
		var id = getCellCacheKey(root)
		var node = root == window.document || root == window.document.documentElement ? documentNode : root
		if (cellCache[id] === undefined) clear(node.childNodes)
		cellCache[id] = build(node, null, undefined, undefined, cell, cellCache[id], false, 0, null, undefined, configs)
		for (var i = 0; i < configs.length; i++) configs[i]()
	}
	function getCellCacheKey(element) {
		var index = nodeCache.indexOf(element)
		return index < 0 ? nodeCache.push(element) - 1 : index
	}

	m.trust = function(value) {
		value = new String(value)
		value.$trusted = true
		return value
	}

	var roots = [], modules = [], controllers = [], lastRedrawId = 0, computePostRedrawHook = null
	m.module = function(root, module) {
		var index = roots.indexOf(root)
		if (index < 0) index = roots.length
		var isPrevented = false
		if (controllers[index] && typeof controllers[index].onunload == "function") {
			var event = {
				preventDefault: function() {isPrevented = true}
			}
			controllers[index].onunload(event)
		}
		if (!isPrevented) {
			m.startComputation()
			roots[index] = root
			modules[index] = module
			controllers[index] = new module.controller
			m.endComputation()
		}
	}
	m.redraw = function() {
		var cancel = window.cancelAnimationFrame || window.clearTimeout
		var defer = window.requestAnimationFrame || window.setTimeout
		if (lastRedrawId) {
			cancel(lastRedrawId)
			lastRedrawId = defer(redraw, 0)
		}
		else {
			redraw()
			lastRedrawId = defer(function() {lastRedrawId = null}, 0)
		}
	}
	function redraw() {
		for (var i = 0; i < roots.length; i++) {
			if (controllers[i]) m.render(roots[i], modules[i].view(controllers[i]))
		}
		if (computePostRedrawHook) {
			computePostRedrawHook()
			computePostRedrawHook = null
		}
		lastRedrawId = null
	}

	var pendingRequests = 0
	m.startComputation = function() {pendingRequests++}
	m.endComputation = function() {
		pendingRequests = Math.max(pendingRequests - 1, 0)
		if (pendingRequests == 0) m.redraw()
	}

	m.withAttr = function(prop, withAttrCallback) {
    	
		return function(e) {
			//e = e || event
            target = this;
            withAttrCallback(prop in target ? target[prop] : target.getAttribute(prop))
		}
	}

	//routing
	var modes = {pathname: "", hash: "#", search: "?"}
	var redirect = function() {}, routeParams = {}, currentRoute
	m.route = function() {
		if (arguments.length === 0) return currentRoute
		else if (arguments.length === 3 && typeof arguments[1] == "string") {
			var root = arguments[0], defaultRoute = arguments[1], router = arguments[2]
			redirect = function(source) {
				var path = currentRoute = normalizeRoute(source)
				if (!routeByValue(root, router, path)) {
					m.route(defaultRoute, true)
				}
			}
			var listener = m.route.mode == "hash" ? "onhashchange" : "onpopstate"
			window[listener] = function() {
				if (currentRoute != normalizeRoute(window.location[m.route.mode])) {
					redirect(window.location[m.route.mode])
				}
			}
			computePostRedrawHook = setScroll
			window[listener]()
		}
		else if (arguments[0].addEventListener) {
			var element = arguments[0]
			var isInitialized = arguments[1]
			if (element.href.indexOf(modes[m.route.mode]) < 0) {
				element.href = window.location.pathname + modes[m.route.mode] + element.pathname
			}
			if (!isInitialized) {
				element.removeEventListener("click", routeUnobtrusive)
				element.addEventListener("click", routeUnobtrusive)
			}
		}
		else if (typeof arguments[0] == "string") {
			currentRoute = arguments[0]
			var querystring = typeof arguments[1] == "object" ? buildQueryString(arguments[1]) : null
			if (querystring) currentRoute += (currentRoute.indexOf("?") === -1 ? "?" : "&") + querystring

			var shouldReplaceHistoryEntry = (arguments.length == 3 ? arguments[2] : arguments[1]) === true
			
			if (window.history.pushState) {
				computePostRedrawHook = function() {
					window.history[shouldReplaceHistoryEntry ? "replaceState" : "pushState"](null, window.document.title, modes[m.route.mode] + currentRoute)
					setScroll()
				}
				redirect(modes[m.route.mode] + currentRoute)
			}
			else window.location[m.route.mode] = currentRoute
		}
	}
	m.route.param = function(key) {return routeParams[key]}
	m.route.mode = "search"
	function normalizeRoute(route) {return route.slice(modes[m.route.mode].length)}
	function routeByValue(root, router, path) {
		routeParams = {}

		var queryStart = path.indexOf("?")
		if (queryStart !== -1) {
			routeParams = parseQueryString(path.substr(queryStart + 1, path.length))
			path = path.substr(0, queryStart)
		}

		for (var route in router) {
			if (route == path) {
				reset(root)
				m.module(root, router[route])
				return true
			}

			var matcher = new RegExp("^" + route.replace(/:[^\/]+?\.{3}/g, "(.*?)").replace(/:[^\/]+/g, "([^\\/]+)") + "\/?$")

			if (matcher.test(path)) {
				reset(root)
				path.replace(matcher, function() {
					var keys = route.match(/:[^\/]+/g) || []
					var values = [].slice.call(arguments, 1, -2)
					for (var i = 0; i < keys.length; i++) routeParams[keys[i].replace(/:|\./g, "")] = decodeSpace(values[i])
					m.module(root, router[route])
				})
				return true
			}
		}
	}
	function reset(root) {
		var cacheKey = getCellCacheKey(root)
		clear(root.childNodes, cellCache[cacheKey])
		cellCache[cacheKey] = undefined
	}
	function routeUnobtrusive(e) {
		e = e || event
		if (e.ctrlKey || e.metaKey || e.which == 2) return
		e.preventDefault()
		m.route(e.currentTarget[m.route.mode].slice(modes[m.route.mode].length))
	}
	function setScroll() {
		if (m.route.mode != "hash" && window.location.hash) window.location.hash = window.location.hash
		else window.scrollTo(0, 0)
	}
	function buildQueryString(object, prefix) {
    
		var str = []
		for(var prop in object) {
        	// TODO: Goes into endless recursion, because
            // object 'window' has the property 'window'
            // -> prevent that this is called with object=window
			var key = prefix ? prefix + "[" + prop + "]" : prop, value = object[prop]
			str.push(typeof value == "object" ? buildQueryString(value, key) : encodeURIComponent(key) + "=" + encodeURIComponent(value))
		}
		return str.join("&")
	}
	function parseQueryString(str) {
		var pairs = str.split("&"), params = {}
		for (var i = 0; i < pairs.length; i++) {
			var pair = pairs[i].split("=")
			params[decodeSpace(pair[0])] = pair[1] ? decodeSpace(pair[1]) : (pair.length === 1 ? true : "")
		}
		return params
	}
	function decodeSpace(string) {
		return decodeURIComponent(string.replace(/\+/g, " "))
	}

	//model
	m.prop = function(store) {
		var prop = function() {
			if (arguments.length) store = arguments[0]
			return store
		}
		prop.toJSON = function() {
			return store
		}
		return prop
	}

	var none = {}
	m.deferred = function() {
		var resolvers = [], rejecters = [], resolved = none, rejected = none, promise = m.prop()
		var object = {
			resolve: function(value) {
				if (resolved === none) promise(resolved = value)
				for (var i = 0; i < resolvers.length; i++) resolvers[i](value)
				resolvers.length = rejecters.length = 0
			},
			reject: function(value) {
				if (rejected === none) rejected = value
				for (var i = 0; i < rejecters.length; i++) rejecters[i](value)
				resolvers.length = rejecters.length = 0
			},
			promise: promise
		}
		object.promise.resolvers = resolvers
		object.promise.then = function(success, error) {
			var next = m.deferred()
			if (!success) success = identity
			if (!error) error = identity
			function callback(method, callback) {
				return function(value) {
					try {
						var result = callback(value)
						if (result && typeof result.then == "function") result.then(next[method], error)
						else next[method](result !== undefined ? result : value)
					}
					catch (e) {
						if (e instanceof Error && e.constructor !== Error) throw e
						else next.reject(e)
					}
				}
			}
			if (resolved !== none) callback("resolve", success)(resolved)
			else if (rejected !== none) callback("reject", error)(rejected)
			else {
				resolvers.push(callback("resolve", success))
				rejecters.push(callback("reject", error))
			}
			return next.promise
		}
		return object
	}
	m.sync = function(args) {
		var method = "resolve"
		function synchronizer(pos, resolved) {
			return function(value) {
				results[pos] = value
				if (!resolved) method = "reject"
				if (--outstanding == 0) {
					deferred.promise(results)
					deferred[method](results)
				}
				return value
			}
		}

		var deferred = m.deferred()
		var outstanding = args.length
		var results = new Array(outstanding)
		for (var i = 0; i < args.length; i++) {
			args[i].then(synchronizer(i, true), synchronizer(i, false))
		}
		return deferred.promise
	}
	function identity(value) {return value}

	function ajax(options) {
		var xhr = new window.XMLHttpRequest
		xhr.open(options.method, options.url, true, options.user, options.password)
		xhr.onreadystatechange = function() {
			if (xhr.readyState === 4) {
				if (xhr.status >= 200 && xhr.status < 300) options.onload({type: "load", target: xhr})
				else options.onerror({type: "error", target: xhr})
			}
		}
		if (options.serialize == JSON.stringify && options.method != "GET") {
			xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
		}
		if (typeof options.config == "function") {
			var maybeXhr = options.config(xhr, options)
			if (maybeXhr !== undefined) xhr = maybeXhr
		}
		xhr.send(options.method == "GET" ? "" : options.data)
		return xhr
	}
	function bindData(xhrOptions, data, serialize) {
		if (data && Object.keys(data).length > 0) {
			if (xhrOptions.method == "GET") {
				xhrOptions.url = xhrOptions.url + (xhrOptions.url.indexOf("?") < 0 ? "?" : "&") + buildQueryString(data)
			}
			else xhrOptions.data = serialize(data)
		}
		return xhrOptions
	}
	function parameterizeUrl(url, data) {
		var tokens = url.match(/:[a-z]\w+/gi)
		if (tokens && data) {
			for (var i = 0; i < tokens.length; i++) {
				var key = tokens[i].slice(1)
				url = url.replace(tokens[i], data[key])
				delete data[key]
			}
		}
		return url
	}

	m.request = function(xhrOptions) {
		if (xhrOptions.background !== true) m.startComputation()
		var deferred = m.deferred()
		var serialize = xhrOptions.serialize = xhrOptions.serialize || JSON.stringify
		var deserialize = xhrOptions.deserialize = xhrOptions.deserialize || JSON.parse
		var extract = xhrOptions.extract || function(xhr) {
			return xhr.responseText.length === 0 && deserialize === JSON.parse ? null : xhr.responseText
		}
		xhrOptions.url = parameterizeUrl(xhrOptions.url, xhrOptions.data)
		xhrOptions = bindData(xhrOptions, xhrOptions.data, serialize)
		xhrOptions.onload = xhrOptions.onerror = function(e) {
			try {
				e = e || event
				var unwrap = (e.type == "load" ? xhrOptions.unwrapSuccess : xhrOptions.unwrapError) || identity
				var response = unwrap(deserialize(extract(e.target, xhrOptions)))
				if (e.type == "load") {
					if (response instanceof Array && xhrOptions.type) {
						for (var i = 0; i < response.length; i++) response[i] = new xhrOptions.type(response[i])
					}
					else if (xhrOptions.type) response = new xhrOptions.type(response)
				}
				deferred[e.type == "load" ? "resolve" : "reject"](response)
			}
			catch (e) {
				if (e instanceof SyntaxError) throw new SyntaxError("Could not parse HTTP response. See http://lhorie.github.io/mithril/mithril.request.html#using-variable-data-formats")
				else if (e instanceof Error && e.constructor !== Error) throw e
				else deferred.reject(e)
			}
			if (xhrOptions.background !== true) m.endComputation()
		}
		ajax(xhrOptions)
		return deferred.promise
	}

	//testing API
	m.deps = function(mock) {return window = mock}
	//for internal testing only, do not use `m.deps.factory`
	m.deps.factory = app

	return m
}(typeof window != "undefined" ? window : {})

if (typeof module != "undefined" && module !== null) module.exports = m
if (typeof define == "function" && define.amd) define(function() {return m})

;;;

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
"use strict";function q(a){throw a;}var t=void 0,u=!1;var sjcl={cipher:{},hash:{},keyexchange:{},mode:{},misc:{},codec:{},exception:{corrupt:function(a){this.toString=function(){return"CORRUPT: "+this.message};this.message=a},invalid:function(a){this.toString=function(){return"INVALID: "+this.message};this.message=a},bug:function(a){this.toString=function(){return"BUG: "+this.message};this.message=a},notReady:function(a){this.toString=function(){return"NOT READY: "+this.message};this.message=a}}};
"undefined"!==typeof module&&module.exports&&(module.exports=sjcl);

if(typeof define === "function") {
	define([], function () {
        return sjcl;
    });
}

sjcl.cipher.aes=function(a){this.k[0][0][0]||this.D();var b,c,d,e,f=this.k[0][4],g=this.k[1];b=a.length;var h=1;4!==b&&(6!==b&&8!==b)&&q(new sjcl.exception.invalid("invalid aes key size"));this.b=[d=a.slice(0),e=[]];for(a=b;a<4*b+28;a++){c=d[a-1];if(0===a%b||8===b&&4===a%b)c=f[c>>>24]<<24^f[c>>16&255]<<16^f[c>>8&255]<<8^f[c&255],0===a%b&&(c=c<<8^c>>>24^h<<24,h=h<<1^283*(h>>7));d[a]=d[a-b]^c}for(b=0;a;b++,a--)c=d[b&3?a:a-4],e[b]=4>=a||4>b?c:g[0][f[c>>>24]]^g[1][f[c>>16&255]]^g[2][f[c>>8&255]]^g[3][f[c&
255]]};
sjcl.cipher.aes.prototype={encrypt:function(a){return y(this,a,0)},decrypt:function(a){return y(this,a,1)},k:[[[],[],[],[],[]],[[],[],[],[],[]]],D:function(){var a=this.k[0],b=this.k[1],c=a[4],d=b[4],e,f,g,h=[],l=[],k,n,m,p;for(e=0;0x100>e;e++)l[(h[e]=e<<1^283*(e>>7))^e]=e;for(f=g=0;!c[f];f^=k||1,g=l[g]||1){m=g^g<<1^g<<2^g<<3^g<<4;m=m>>8^m&255^99;c[f]=m;d[m]=f;n=h[e=h[k=h[f]]];p=0x1010101*n^0x10001*e^0x101*k^0x1010100*f;n=0x101*h[m]^0x1010100*m;for(e=0;4>e;e++)a[e][f]=n=n<<24^n>>>8,b[e][m]=p=p<<24^p>>>8}for(e=
0;5>e;e++)a[e]=a[e].slice(0),b[e]=b[e].slice(0)}};
function y(a,b,c){4!==b.length&&q(new sjcl.exception.invalid("invalid aes block size"));var d=a.b[c],e=b[0]^d[0],f=b[c?3:1]^d[1],g=b[2]^d[2];b=b[c?1:3]^d[3];var h,l,k,n=d.length/4-2,m,p=4,s=[0,0,0,0];h=a.k[c];a=h[0];var r=h[1],v=h[2],w=h[3],x=h[4];for(m=0;m<n;m++)h=a[e>>>24]^r[f>>16&255]^v[g>>8&255]^w[b&255]^d[p],l=a[f>>>24]^r[g>>16&255]^v[b>>8&255]^w[e&255]^d[p+1],k=a[g>>>24]^r[b>>16&255]^v[e>>8&255]^w[f&255]^d[p+2],b=a[b>>>24]^r[e>>16&255]^v[f>>8&255]^w[g&255]^d[p+3],p+=4,e=h,f=l,g=k;for(m=0;4>
m;m++)s[c?3&-m:m]=x[e>>>24]<<24^x[f>>16&255]<<16^x[g>>8&255]<<8^x[b&255]^d[p++],h=e,e=f,f=g,g=b,b=h;return s}
sjcl.bitArray={bitSlice:function(a,b,c){a=sjcl.bitArray.P(a.slice(b/32),32-(b&31)).slice(1);return c===t?a:sjcl.bitArray.clamp(a,c-b)},extract:function(a,b,c){var d=Math.floor(-b-c&31);return((b+c-1^b)&-32?a[b/32|0]<<32-d^a[b/32+1|0]>>>d:a[b/32|0]>>>d)&(1<<c)-1},concat:function(a,b){if(0===a.length||0===b.length)return a.concat(b);var c=a[a.length-1],d=sjcl.bitArray.getPartial(c);return 32===d?a.concat(b):sjcl.bitArray.P(b,d,c|0,a.slice(0,a.length-1))},bitLength:function(a){var b=a.length;return 0===
b?0:32*(b-1)+sjcl.bitArray.getPartial(a[b-1])},clamp:function(a,b){if(32*a.length<b)return a;a=a.slice(0,Math.ceil(b/32));var c=a.length;b&=31;0<c&&b&&(a[c-1]=sjcl.bitArray.partial(b,a[c-1]&2147483648>>b-1,1));return a},partial:function(a,b,c){return 32===a?b:(c?b|0:b<<32-a)+0x10000000000*a},getPartial:function(a){return Math.round(a/0x10000000000)||32},equal:function(a,b){if(sjcl.bitArray.bitLength(a)!==sjcl.bitArray.bitLength(b))return u;var c=0,d;for(d=0;d<a.length;d++)c|=a[d]^b[d];return 0===
c},P:function(a,b,c,d){var e;e=0;for(d===t&&(d=[]);32<=b;b-=32)d.push(c),c=0;if(0===b)return d.concat(a);for(e=0;e<a.length;e++)d.push(c|a[e]>>>b),c=a[e]<<32-b;e=a.length?a[a.length-1]:0;a=sjcl.bitArray.getPartial(e);d.push(sjcl.bitArray.partial(b+a&31,32<b+a?c:d.pop(),1));return d},l:function(a,b){return[a[0]^b[0],a[1]^b[1],a[2]^b[2],a[3]^b[3]]}};
sjcl.codec.utf8String={fromBits:function(a){var b="",c=sjcl.bitArray.bitLength(a),d,e;for(d=0;d<c/8;d++)0===(d&3)&&(e=a[d/4]),b+=String.fromCharCode(e>>>24),e<<=8;return decodeURIComponent(escape(b))},toBits:function(a){a=unescape(encodeURIComponent(a));var b=[],c,d=0;for(c=0;c<a.length;c++)d=d<<8|a.charCodeAt(c),3===(c&3)&&(b.push(d),d=0);c&3&&b.push(sjcl.bitArray.partial(8*(c&3),d));return b}};
sjcl.codec.hex={fromBits:function(a){var b="",c;for(c=0;c<a.length;c++)b+=((a[c]|0)+0xf00000000000).toString(16).substr(4);return b.substr(0,sjcl.bitArray.bitLength(a)/4)},toBits:function(a){var b,c=[],d;a=a.replace(/\s|0x/g,"");d=a.length;a+="00000000";for(b=0;b<a.length;b+=8)c.push(parseInt(a.substr(b,8),16)^0);return sjcl.bitArray.clamp(c,4*d)}};
sjcl.codec.base64={J:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",fromBits:function(a,b,c){var d="",e=0,f=sjcl.codec.base64.J,g=0,h=sjcl.bitArray.bitLength(a);c&&(f=f.substr(0,62)+"-_");for(c=0;6*d.length<h;)d+=f.charAt((g^a[c]>>>e)>>>26),6>e?(g=a[c]<<6-e,e+=26,c++):(g<<=6,e-=6);for(;d.length&3&&!b;)d+="=";return d},toBits:function(a,b){a=a.replace(/\s|=/g,"");var c=[],d,e=0,f=sjcl.codec.base64.J,g=0,h;b&&(f=f.substr(0,62)+"-_");for(d=0;d<a.length;d++)h=f.indexOf(a.charAt(d)),
0>h&&q(new sjcl.exception.invalid("this isn't base64!")),26<e?(e-=26,c.push(g^h>>>e),g=h<<32-e):(e+=6,g^=h<<32-e);e&56&&c.push(sjcl.bitArray.partial(e&56,g,1));return c}};sjcl.codec.base64url={fromBits:function(a){return sjcl.codec.base64.fromBits(a,1,1)},toBits:function(a){return sjcl.codec.base64.toBits(a,1)}};sjcl.hash.sha256=function(a){this.b[0]||this.D();a?(this.r=a.r.slice(0),this.o=a.o.slice(0),this.h=a.h):this.reset()};sjcl.hash.sha256.hash=function(a){return(new sjcl.hash.sha256).update(a).finalize()};
sjcl.hash.sha256.prototype={blockSize:512,reset:function(){this.r=this.N.slice(0);this.o=[];this.h=0;return this},update:function(a){"string"===typeof a&&(a=sjcl.codec.utf8String.toBits(a));var b,c=this.o=sjcl.bitArray.concat(this.o,a);b=this.h;a=this.h=b+sjcl.bitArray.bitLength(a);for(b=512+b&-512;b<=a;b+=512)z(this,c.splice(0,16));return this},finalize:function(){var a,b=this.o,c=this.r,b=sjcl.bitArray.concat(b,[sjcl.bitArray.partial(1,1)]);for(a=b.length+2;a&15;a++)b.push(0);b.push(Math.floor(this.h/
4294967296));for(b.push(this.h|0);b.length;)z(this,b.splice(0,16));this.reset();return c},N:[],b:[],D:function(){function a(a){return 0x100000000*(a-Math.floor(a))|0}var b=0,c=2,d;a:for(;64>b;c++){for(d=2;d*d<=c;d++)if(0===c%d)continue a;8>b&&(this.N[b]=a(Math.pow(c,0.5)));this.b[b]=a(Math.pow(c,1/3));b++}}};
function z(a,b){var c,d,e,f=b.slice(0),g=a.r,h=a.b,l=g[0],k=g[1],n=g[2],m=g[3],p=g[4],s=g[5],r=g[6],v=g[7];for(c=0;64>c;c++)16>c?d=f[c]:(d=f[c+1&15],e=f[c+14&15],d=f[c&15]=(d>>>7^d>>>18^d>>>3^d<<25^d<<14)+(e>>>17^e>>>19^e>>>10^e<<15^e<<13)+f[c&15]+f[c+9&15]|0),d=d+v+(p>>>6^p>>>11^p>>>25^p<<26^p<<21^p<<7)+(r^p&(s^r))+h[c],v=r,r=s,s=p,p=m+d|0,m=n,n=k,k=l,l=d+(k&n^m&(k^n))+(k>>>2^k>>>13^k>>>22^k<<30^k<<19^k<<10)|0;g[0]=g[0]+l|0;g[1]=g[1]+k|0;g[2]=g[2]+n|0;g[3]=g[3]+m|0;g[4]=g[4]+p|0;g[5]=g[5]+s|0;g[6]=
g[6]+r|0;g[7]=g[7]+v|0}
sjcl.mode.ccm={name:"ccm",encrypt:function(a,b,c,d,e){var f,g=b.slice(0),h=sjcl.bitArray,l=h.bitLength(c)/8,k=h.bitLength(g)/8;e=e||64;d=d||[];7>l&&q(new sjcl.exception.invalid("ccm: iv must be at least 7 bytes"));for(f=2;4>f&&k>>>8*f;f++);f<15-l&&(f=15-l);c=h.clamp(c,8*(15-f));b=sjcl.mode.ccm.L(a,b,c,d,e,f);g=sjcl.mode.ccm.p(a,g,c,b,e,f);return h.concat(g.data,g.tag)},decrypt:function(a,b,c,d,e){e=e||64;d=d||[];var f=sjcl.bitArray,g=f.bitLength(c)/8,h=f.bitLength(b),l=f.clamp(b,h-e),k=f.bitSlice(b,
h-e),h=(h-e)/8;7>g&&q(new sjcl.exception.invalid("ccm: iv must be at least 7 bytes"));for(b=2;4>b&&h>>>8*b;b++);b<15-g&&(b=15-g);c=f.clamp(c,8*(15-b));l=sjcl.mode.ccm.p(a,l,c,k,e,b);a=sjcl.mode.ccm.L(a,l.data,c,d,e,b);f.equal(l.tag,a)||q(new sjcl.exception.corrupt("ccm: tag doesn't match"));return l.data},L:function(a,b,c,d,e,f){var g=[],h=sjcl.bitArray,l=h.l;e/=8;(e%2||4>e||16<e)&&q(new sjcl.exception.invalid("ccm: invalid tag length"));(0xffffffff<d.length||0xffffffff<b.length)&&q(new sjcl.exception.bug("ccm: can't deal with 4GiB or more data"));
f=[h.partial(8,(d.length?64:0)|e-2<<2|f-1)];f=h.concat(f,c);f[3]|=h.bitLength(b)/8;f=a.encrypt(f);if(d.length){c=h.bitLength(d)/8;65279>=c?g=[h.partial(16,c)]:0xffffffff>=c&&(g=h.concat([h.partial(16,65534)],[c]));g=h.concat(g,d);for(d=0;d<g.length;d+=4)f=a.encrypt(l(f,g.slice(d,d+4).concat([0,0,0])))}for(d=0;d<b.length;d+=4)f=a.encrypt(l(f,b.slice(d,d+4).concat([0,0,0])));return h.clamp(f,8*e)},p:function(a,b,c,d,e,f){var g,h=sjcl.bitArray;g=h.l;var l=b.length,k=h.bitLength(b);c=h.concat([h.partial(8,
f-1)],c).concat([0,0,0]).slice(0,4);d=h.bitSlice(g(d,a.encrypt(c)),0,e);if(!l)return{tag:d,data:[]};for(g=0;g<l;g+=4)c[3]++,e=a.encrypt(c),b[g]^=e[0],b[g+1]^=e[1],b[g+2]^=e[2],b[g+3]^=e[3];return{tag:d,data:h.clamp(b,k)}}};
sjcl.mode.ocb2={name:"ocb2",encrypt:function(a,b,c,d,e,f){128!==sjcl.bitArray.bitLength(c)&&q(new sjcl.exception.invalid("ocb iv must be 128 bits"));var g,h=sjcl.mode.ocb2.H,l=sjcl.bitArray,k=l.l,n=[0,0,0,0];c=h(a.encrypt(c));var m,p=[];d=d||[];e=e||64;for(g=0;g+4<b.length;g+=4)m=b.slice(g,g+4),n=k(n,m),p=p.concat(k(c,a.encrypt(k(c,m)))),c=h(c);m=b.slice(g);b=l.bitLength(m);g=a.encrypt(k(c,[0,0,0,b]));m=l.clamp(k(m.concat([0,0,0]),g),b);n=k(n,k(m.concat([0,0,0]),g));n=a.encrypt(k(n,k(c,h(c))));d.length&&
(n=k(n,f?d:sjcl.mode.ocb2.pmac(a,d)));return p.concat(l.concat(m,l.clamp(n,e)))},decrypt:function(a,b,c,d,e,f){128!==sjcl.bitArray.bitLength(c)&&q(new sjcl.exception.invalid("ocb iv must be 128 bits"));e=e||64;var g=sjcl.mode.ocb2.H,h=sjcl.bitArray,l=h.l,k=[0,0,0,0],n=g(a.encrypt(c)),m,p,s=sjcl.bitArray.bitLength(b)-e,r=[];d=d||[];for(c=0;c+4<s/32;c+=4)m=l(n,a.decrypt(l(n,b.slice(c,c+4)))),k=l(k,m),r=r.concat(m),n=g(n);p=s-32*c;m=a.encrypt(l(n,[0,0,0,p]));m=l(m,h.clamp(b.slice(c),p).concat([0,0,0]));
k=l(k,m);k=a.encrypt(l(k,l(n,g(n))));d.length&&(k=l(k,f?d:sjcl.mode.ocb2.pmac(a,d)));h.equal(h.clamp(k,e),h.bitSlice(b,s))||q(new sjcl.exception.corrupt("ocb: tag doesn't match"));return r.concat(h.clamp(m,p))},pmac:function(a,b){var c,d=sjcl.mode.ocb2.H,e=sjcl.bitArray,f=e.l,g=[0,0,0,0],h=a.encrypt([0,0,0,0]),h=f(h,d(d(h)));for(c=0;c+4<b.length;c+=4)h=d(h),g=f(g,a.encrypt(f(h,b.slice(c,c+4))));c=b.slice(c);128>e.bitLength(c)&&(h=f(h,d(h)),c=e.concat(c,[-2147483648,0,0,0]));g=f(g,c);return a.encrypt(f(d(f(h,
d(h))),g))},H:function(a){return[a[0]<<1^a[1]>>>31,a[1]<<1^a[2]>>>31,a[2]<<1^a[3]>>>31,a[3]<<1^135*(a[0]>>>31)]}};
sjcl.mode.gcm={name:"gcm",encrypt:function(a,b,c,d,e){var f=b.slice(0);b=sjcl.bitArray;d=d||[];a=sjcl.mode.gcm.p(!0,a,f,d,c,e||128);return b.concat(a.data,a.tag)},decrypt:function(a,b,c,d,e){var f=b.slice(0),g=sjcl.bitArray,h=g.bitLength(f);e=e||128;d=d||[];e<=h?(b=g.bitSlice(f,h-e),f=g.bitSlice(f,0,h-e)):(b=f,f=[]);a=sjcl.mode.gcm.p(u,a,f,d,c,e);g.equal(a.tag,b)||q(new sjcl.exception.corrupt("gcm: tag doesn't match"));return a.data},Z:function(a,b){var c,d,e,f,g,h=sjcl.bitArray.l;e=[0,0,0,0];f=b.slice(0);
for(c=0;128>c;c++){(d=0!==(a[Math.floor(c/32)]&1<<31-c%32))&&(e=h(e,f));g=0!==(f[3]&1);for(d=3;0<d;d--)f[d]=f[d]>>>1|(f[d-1]&1)<<31;f[0]>>>=1;g&&(f[0]^=-0x1f000000)}return e},g:function(a,b,c){var d,e=c.length;b=b.slice(0);for(d=0;d<e;d+=4)b[0]^=0xffffffff&c[d],b[1]^=0xffffffff&c[d+1],b[2]^=0xffffffff&c[d+2],b[3]^=0xffffffff&c[d+3],b=sjcl.mode.gcm.Z(b,a);return b},p:function(a,b,c,d,e,f){var g,h,l,k,n,m,p,s,r=sjcl.bitArray;m=c.length;p=r.bitLength(c);s=r.bitLength(d);h=r.bitLength(e);g=b.encrypt([0,
0,0,0]);96===h?(e=e.slice(0),e=r.concat(e,[1])):(e=sjcl.mode.gcm.g(g,[0,0,0,0],e),e=sjcl.mode.gcm.g(g,e,[0,0,Math.floor(h/0x100000000),h&0xffffffff]));h=sjcl.mode.gcm.g(g,[0,0,0,0],d);n=e.slice(0);d=h.slice(0);a||(d=sjcl.mode.gcm.g(g,h,c));for(k=0;k<m;k+=4)n[3]++,l=b.encrypt(n),c[k]^=l[0],c[k+1]^=l[1],c[k+2]^=l[2],c[k+3]^=l[3];c=r.clamp(c,p);a&&(d=sjcl.mode.gcm.g(g,h,c));a=[Math.floor(s/0x100000000),s&0xffffffff,Math.floor(p/0x100000000),p&0xffffffff];d=sjcl.mode.gcm.g(g,d,a);l=b.encrypt(e);d[0]^=l[0];
d[1]^=l[1];d[2]^=l[2];d[3]^=l[3];return{tag:r.bitSlice(d,0,f),data:c}}};sjcl.misc.hmac=function(a,b){this.M=b=b||sjcl.hash.sha256;var c=[[],[]],d,e=b.prototype.blockSize/32;this.n=[new b,new b];a.length>e&&(a=b.hash(a));for(d=0;d<e;d++)c[0][d]=a[d]^909522486,c[1][d]=a[d]^1549556828;this.n[0].update(c[0]);this.n[1].update(c[1]);this.G=new b(this.n[0])};
sjcl.misc.hmac.prototype.encrypt=sjcl.misc.hmac.prototype.mac=function(a){this.Q&&q(new sjcl.exception.invalid("encrypt on already updated hmac called!"));this.update(a);return this.digest(a)};sjcl.misc.hmac.prototype.reset=function(){this.G=new this.M(this.n[0]);this.Q=u};sjcl.misc.hmac.prototype.update=function(a){this.Q=!0;this.G.update(a)};sjcl.misc.hmac.prototype.digest=function(){var a=this.G.finalize(),a=(new this.M(this.n[1])).update(a).finalize();this.reset();return a};
sjcl.misc.pbkdf2=function(a,b,c,d,e){c=c||1E3;(0>d||0>c)&&q(sjcl.exception.invalid("invalid params to pbkdf2"));"string"===typeof a&&(a=sjcl.codec.utf8String.toBits(a));"string"===typeof b&&(b=sjcl.codec.utf8String.toBits(b));e=e||sjcl.misc.hmac;a=new e(a);var f,g,h,l,k=[],n=sjcl.bitArray;for(l=1;32*k.length<(d||1);l++){e=f=a.encrypt(n.concat(b,[l]));for(g=1;g<c;g++){f=a.encrypt(f);for(h=0;h<f.length;h++)e[h]^=f[h]}k=k.concat(e)}d&&(k=n.clamp(k,d));return k};
sjcl.prng=function(a){this.c=[new sjcl.hash.sha256];this.i=[0];this.F=0;this.s={};this.C=0;this.K={};this.O=this.d=this.j=this.W=0;this.b=[0,0,0,0,0,0,0,0];this.f=[0,0,0,0];this.A=t;this.B=a;this.q=u;this.w={progress:{},seeded:{}};this.m=this.V=0;this.t=1;this.u=2;this.S=0x10000;this.I=[0,48,64,96,128,192,0x100,384,512,768,1024];this.T=3E4;this.R=80};
sjcl.prng.prototype={randomWords:function(a,b){var c=[],d;d=this.isReady(b);var e;d===this.m&&q(new sjcl.exception.notReady("generator isn't seeded"));if(d&this.u){d=!(d&this.t);e=[];var f=0,g;this.O=e[0]=(new Date).valueOf()+this.T;for(g=0;16>g;g++)e.push(0x100000000*Math.random()|0);for(g=0;g<this.c.length&&!(e=e.concat(this.c[g].finalize()),f+=this.i[g],this.i[g]=0,!d&&this.F&1<<g);g++);this.F>=1<<this.c.length&&(this.c.push(new sjcl.hash.sha256),this.i.push(0));this.d-=f;f>this.j&&(this.j=f);this.F++;
this.b=sjcl.hash.sha256.hash(this.b.concat(e));this.A=new sjcl.cipher.aes(this.b);for(d=0;4>d&&!(this.f[d]=this.f[d]+1|0,this.f[d]);d++);}for(d=0;d<a;d+=4)0===(d+1)%this.S&&A(this),e=B(this),c.push(e[0],e[1],e[2],e[3]);A(this);return c.slice(0,a)},setDefaultParanoia:function(a,b){0===a&&"Setting paranoia=0 will ruin your security; use it only for testing"!==b&&q("Setting paranoia=0 will ruin your security; use it only for testing");this.B=a},addEntropy:function(a,b,c){c=c||"user";var d,e,f=(new Date).valueOf(),
g=this.s[c],h=this.isReady(),l=0;d=this.K[c];d===t&&(d=this.K[c]=this.W++);g===t&&(g=this.s[c]=0);this.s[c]=(this.s[c]+1)%this.c.length;switch(typeof a){case "number":b===t&&(b=1);this.c[g].update([d,this.C++,1,b,f,1,a|0]);break;case "object":c=Object.prototype.toString.call(a);if("[object Uint32Array]"===c){e=[];for(c=0;c<a.length;c++)e.push(a[c]);a=e}else{"[object Array]"!==c&&(l=1);for(c=0;c<a.length&&!l;c++)"number"!==typeof a[c]&&(l=1)}if(!l){if(b===t)for(c=b=0;c<a.length;c++)for(e=a[c];0<e;)b++,
e>>>=1;this.c[g].update([d,this.C++,2,b,f,a.length].concat(a))}break;case "string":b===t&&(b=a.length);this.c[g].update([d,this.C++,3,b,f,a.length]);this.c[g].update(a);break;default:l=1}l&&q(new sjcl.exception.bug("random: addEntropy only supports number, array of numbers or string"));this.i[g]+=b;this.d+=b;h===this.m&&(this.isReady()!==this.m&&C("seeded",Math.max(this.j,this.d)),C("progress",this.getProgress()))},isReady:function(a){a=this.I[a!==t?a:this.B];return this.j&&this.j>=a?this.i[0]>this.R&&
(new Date).valueOf()>this.O?this.u|this.t:this.t:this.d>=a?this.u|this.m:this.m},getProgress:function(a){a=this.I[a?a:this.B];return this.j>=a?1:this.d>a?1:this.d/a},startCollectors:function(){this.q||(this.a={loadTimeCollector:D(this,this.aa),mouseCollector:D(this,this.ba),keyboardCollector:D(this,this.$),accelerometerCollector:D(this,this.U)},window.addEventListener?(window.addEventListener("load",this.a.loadTimeCollector,u),window.addEventListener("mousemove",this.a.mouseCollector,u),window.addEventListener("keypress",
this.a.keyboardCollector,u),window.addEventListener("devicemotion",this.a.accelerometerCollector,u)):document.attachEvent?(document.attachEvent("onload",this.a.loadTimeCollector),document.attachEvent("onmousemove",this.a.mouseCollector),document.attachEvent("keypress",this.a.keyboardCollector)):q(new sjcl.exception.bug("can't attach event")),this.q=!0)},stopCollectors:function(){this.q&&(window.removeEventListener?(window.removeEventListener("load",this.a.loadTimeCollector,u),window.removeEventListener("mousemove",
this.a.mouseCollector,u),window.removeEventListener("keypress",this.a.keyboardCollector,u),window.removeEventListener("devicemotion",this.a.accelerometerCollector,u)):document.detachEvent&&(document.detachEvent("onload",this.a.loadTimeCollector),document.detachEvent("onmousemove",this.a.mouseCollector),document.detachEvent("keypress",this.a.keyboardCollector)),this.q=u)},addEventListener:function(a,b){this.w[a][this.V++]=b},removeEventListener:function(a,b){var c,d,e=this.w[a],f=[];for(d in e)e.hasOwnProperty(d)&&
e[d]===b&&f.push(d);for(c=0;c<f.length;c++)d=f[c],delete e[d]},$:function(){E(1)},ba:function(a){sjcl.random.addEntropy([a.x||a.clientX||a.offsetX||0,a.y||a.clientY||a.offsetY||0],2,"mouse");E(0)},aa:function(){E(2)},U:function(a){a=a.accelerationIncludingGravity.x||a.accelerationIncludingGravity.y||a.accelerationIncludingGravity.z;var b="";window.orientation&&(b=window.orientation);sjcl.random.addEntropy([a,b],3,"accelerometer");E(0)}};
function C(a,b){var c,d=sjcl.random.w[a],e=[];for(c in d)d.hasOwnProperty(c)&&e.push(d[c]);for(c=0;c<e.length;c++)e[c](b)}function E(a){window&&window.performance&&"function"===typeof window.performance.now?sjcl.random.addEntropy(window.performance.now(),a,"loadtime"):sjcl.random.addEntropy((new Date).valueOf(),a,"loadtime")}function A(a){a.b=B(a).concat(B(a));a.A=new sjcl.cipher.aes(a.b)}function B(a){for(var b=0;4>b&&!(a.f[b]=a.f[b]+1|0,a.f[b]);b++);return a.A.encrypt(a.f)}
function D(a,b){return function(){b.apply(a,arguments)}}sjcl.random=new sjcl.prng(6);
a:try{var F,G,H;if("undefined"!==typeof module&&module.exports)G=require("crypto"),F=G.randomBytes(128),sjcl.random.addEntropy(F,1024,"crypto['randomBytes']");else if(window&&Uint32Array){H=new Uint32Array(32);if(window.crypto&&window.crypto.getRandomValues)window.crypto.getRandomValues(H);else if(window.msCrypto&&window.msCrypto.getRandomValues)window.msCrypto.getRandomValues(H);else break a;sjcl.random.addEntropy(H,1024,"crypto['getRandomValues']")}}catch(I){console.log("There was an error collecting entropy from the browser:"),
console.log(I)}
sjcl.json={defaults:{v:1,iter:1E3,ks:128,ts:64,mode:"ccm",adata:"",cipher:"aes"},Y:function(a,b,c,d){c=c||{};d=d||{};var e=sjcl.json,f=e.e({iv:sjcl.random.randomWords(4,0)},e.defaults),g;e.e(f,c);c=f.adata;"string"===typeof f.salt&&(f.salt=sjcl.codec.base64.toBits(f.salt));"string"===typeof f.iv&&(f.iv=sjcl.codec.base64.toBits(f.iv));(!sjcl.mode[f.mode]||!sjcl.cipher[f.cipher]||"string"===typeof a&&100>=f.iter||64!==f.ts&&96!==f.ts&&128!==f.ts||128!==f.ks&&192!==f.ks&&0x100!==f.ks||2>f.iv.length||4<
f.iv.length)&&q(new sjcl.exception.invalid("json encrypt: invalid parameters"));"string"===typeof a?(g=sjcl.misc.cachedPbkdf2(a,f),a=g.key.slice(0,f.ks/32),f.salt=g.salt):sjcl.ecc&&a instanceof sjcl.ecc.elGamal.publicKey&&(g=a.kem(),f.kemtag=g.tag,a=g.key.slice(0,f.ks/32));"string"===typeof b&&(b=sjcl.codec.utf8String.toBits(b));"string"===typeof c&&(c=sjcl.codec.utf8String.toBits(c));g=new sjcl.cipher[f.cipher](a);e.e(d,f);d.key=a;f.ct=sjcl.mode[f.mode].encrypt(g,b,f.iv,c,f.ts);return f},encrypt:function(a,
b,c,d){var e=sjcl.json,f=e.Y.apply(e,arguments);return e.encode(f)},X:function(a,b,c,d){c=c||{};d=d||{};var e=sjcl.json;b=e.e(e.e(e.e({},e.defaults),b),c,!0);var f;c=b.adata;"string"===typeof b.salt&&(b.salt=sjcl.codec.base64.toBits(b.salt));"string"===typeof b.iv&&(b.iv=sjcl.codec.base64.toBits(b.iv));(!sjcl.mode[b.mode]||!sjcl.cipher[b.cipher]||"string"===typeof a&&100>=b.iter||64!==b.ts&&96!==b.ts&&128!==b.ts||128!==b.ks&&192!==b.ks&&0x100!==b.ks||!b.iv||2>b.iv.length||4<b.iv.length)&&q(new sjcl.exception.invalid("json decrypt: invalid parameters"));
"string"===typeof a?(f=sjcl.misc.cachedPbkdf2(a,b),a=f.key.slice(0,b.ks/32),b.salt=f.salt):sjcl.ecc&&a instanceof sjcl.ecc.elGamal.secretKey&&(a=a.unkem(sjcl.codec.base64.toBits(b.kemtag)).slice(0,b.ks/32));"string"===typeof c&&(c=sjcl.codec.utf8String.toBits(c));f=new sjcl.cipher[b.cipher](a);c=sjcl.mode[b.mode].decrypt(f,b.ct,b.iv,c,b.ts);e.e(d,b);d.key=a;return sjcl.codec.utf8String.fromBits(c)},decrypt:function(a,b,c,d){var e=sjcl.json;return e.X(a,e.decode(b),c,d)},encode:function(a){var b,c=
"{",d="";for(b in a)if(a.hasOwnProperty(b))switch(b.match(/^[a-z0-9]+$/i)||q(new sjcl.exception.invalid("json encode: invalid property name")),c+=d+'"'+b+'":',d=",",typeof a[b]){case "number":case "boolean":c+=a[b];break;case "string":c+='"'+escape(a[b])+'"';break;case "object":c+='"'+sjcl.codec.base64.fromBits(a[b],0)+'"';break;default:q(new sjcl.exception.bug("json encode: unsupported type"))}return c+"}"},decode:function(a){a=a.replace(/\s/g,"");a.match(/^\{.*\}$/)||q(new sjcl.exception.invalid("json decode: this isn't json!"));
a=a.replace(/^\{|\}$/g,"").split(/,/);var b={},c,d;for(c=0;c<a.length;c++)(d=a[c].match(/^(?:(["']?)([a-z][a-z0-9]*)\1):(?:(\d+)|"([a-z0-9+\/%*_.@=\-]*)")$/i))||q(new sjcl.exception.invalid("json decode: this isn't json!")),b[d[2]]=d[3]?parseInt(d[3],10):d[2].match(/^(ct|salt|iv)$/)?sjcl.codec.base64.toBits(d[4]):unescape(d[4]);return b},e:function(a,b,c){a===t&&(a={});if(b===t)return a;for(var d in b)b.hasOwnProperty(d)&&(c&&(a[d]!==t&&a[d]!==b[d])&&q(new sjcl.exception.invalid("required parameter overridden")),
a[d]=b[d]);return a},ea:function(a,b){var c={},d;for(d in a)a.hasOwnProperty(d)&&a[d]!==b[d]&&(c[d]=a[d]);return c},da:function(a,b){var c={},d;for(d=0;d<b.length;d++)a[b[d]]!==t&&(c[b[d]]=a[b[d]]);return c}};sjcl.encrypt=sjcl.json.encrypt;sjcl.decrypt=sjcl.json.decrypt;sjcl.misc.ca={};
sjcl.misc.cachedPbkdf2=function(a,b){var c=sjcl.misc.ca,d;b=b||{};d=b.iter||1E3;c=c[a]=c[a]||{};d=c[d]=c[d]||{firstSalt:b.salt&&b.salt.length?b.salt.slice(0):sjcl.random.randomWords(2,0)};c=b.salt===t?d.firstSalt:b.salt;d[c]=d[c]||sjcl.misc.pbkdf2(a,c,b.iter);return{key:d[c].slice(0),salt:c.slice(0)}};
