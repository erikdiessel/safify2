/*
Helper method to copy over attributes from one object
to another.
*/

var s = (function(s) {
    
    // Mutates *base*
    s.copy = function(base, copying) {
        for(key in copying) {
            base[key] = copying[key];
        };
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
Some View helpers
=================
*/

var s = (function(s) {
    
    
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
            generator: "Generator",
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
            generator: "Generator",
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
            generator: "Génératrice",
            create_entry_with_generated_password: "Créer un article avec ce mot de passe"
        }
    };
    
    return s;
}(s || {}));
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
   // TODO replace "generator" by "/"
   m.route(document.body, "generator", {
        
       "generator": s.generator
   }); 
});

/*
API interface
=============

This module provides an interface to the safify-api
(safify-api.herokuapp.com). All interactions with
the API should happen using the following functions.

We use the native XMLHttpRequest functions because we
don't want to include a library like jQuery because
of performance reasons (increased code size).
*/

var s = (function(s) {
    
    // exposed as public constant, so that it can
    // be mocked for tests
    s.API_BASE_URL = "https://safify-api.herokuapp.com/";
    
    // This private function returns the url for
    // a specific path of the API
    var API_URL = function(path) {
        // important: use https:// protocol
        return s.API_BASE_URL + path;
    }; 
    
    // Helper function which returns the URL encoding of 
    // the object.
    var toURLEncoding = function(obj) {
    	return Object.keys(obj).map(function(prop) {
        	return encodeURIComponent(prop) + "="
            	+ encodeURIComponent(obj[prop]);    
        }).join("&");  
    };
    
    /*
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
    s.retrieveData = function(username, password, handlers) {
        var request = new XMLHttpRequest();
        // Make an async request to the endpoint /passwords
        // with the parameters:
        // 		username: username
        // 		password: serverPassword
        request.open('GET',
        	API_URL('passwords') + "?" + toURLEncoding({
                "username": username,
                "password": password
            })
        );
       
    	
//         // Check if all handlers are present,
//         // if not: throw an error
//         if(! (handlers["onSuccess"] 
//            && handlers["onAuthentificationFailed"]
//            && handlers["onUsernameNotFound"]
//            && handlers["onNoConnection"]) ) {
//             throw "Error in s.retrieveData: Some handlers" + 
//                 "were not passed.";
//             return;
//         }
        
        // Attach the event handlers
        var deferred = m.deferred();
        
        request.onload = function() {
            // execute the handler belonging to the
            // status code
            
            return { // return needed for syntactical reasons
                "200": deferred.resolve,
                "401": handlers.onAuthentificationFailed,
                "403": handlers.onUsernameNotFound,
                "404": handlers.onNoConnection,
                // status 0 is used when there is no internet
                // connection available
                "0"  : handlers.onNoConnection
            } [request.status] (request.responseText);
        };
        
        // Fire off the request
        request.send();
        
        return deferred.promise;
    };
    
    // This function reqisters a user on the server
    // (via the endpoin '/register').
    // It should *only* be called after an API-call
    // to check whether the username is already used
    // (via s.checkUsernameUsed).
    
    s.registerUser = function(username, password) {
        var request = new XMLHttpRequest();
        request.open('POST', API_URL('register'), true);
        request.setRequestHeader("Content-Type", 
        	"application/x-www-form-urlencoded");
        
        var deferred = m.deferred();
        request.onload = deferred.resolve;
        
        // Send along the data because this is a POST request
        request.send(toURLEncoding({
            "username": username,
            "password": password
        }));
        
        return deferred.promise;
    };
    
    // username: string
    // handlers: {
    // onUsernameFree: function
    // onUsernameUsed: function
    // }

    s.checkForUsername = function(username, handlers) {
        var request = new XMLHttpRequest();
        request.open('GET', API_URL('username_not_used')
        	+ "?" + toURLEncoding({"username": username}));
        
        request.onload = function() {
            // call to status code corresponding handler
            return { 200: onUsernameFree, 409: onUsernameUsed }
            	[request.status]();
        };
        
        request.send();
    };
    
    // Changes the password for authentification on the server
    // to a new one.
    // username: string
    // oldPassword: string   password used before
    // newPassword: string
    // callback: function    triggered when the request completes
    s.changeServerPassword = function(username, oldPassword,
                                      newPassword, callback) {
        var request = new XMLHttpRequest();
        request.open('POST', API_URL('change_password'));
        request.setRequestHeader("Content-Type", 
        	"application/x-www-form-urlencoded");
        request.onload = callback;
        request.send(toURLEncoding({
            "username": username,
            "password": oldPassword,
            "new_password": newPassword
        }));
    };
    
    
    // data: string    The password list to save
    // callback: function     Executed when the request completes
    s.savePasswordList = function(username, password, data) {
    	var request = new XMLHttpRequest();
        request.open('POST', API_URL('passwords'));
        request.setRequestHeader("Content-Type", 
        	"application/x-www-form-urlencoded");
        
        var deferred = m.deferred();
        request.onload = deferred.resolve;
        
        request.send(toURLEncoding({
            "username": username,
            "password": password,
            "password_list": data
        }));
        
        return deferred.promise;
    };
    
    
    return s;
}(s || {}));
/*
The model part of the generator
==============================

This module provides functions for
the generation of passwords, given 
a certain length and the allowed
characters.
*/


var s = (function(s) {
    
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
    s.generatePassword = function(length, uppercase, numbers, specialchars) {
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
    
    
    return s;
}(s || {}));
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
    
    s.clientPassword = function(username, password) {
        
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
    
    
    s.serverPassword = function(username, password) {
        if(serverPassword && username == oldUsername
           && password == oldPassword) {
            return serverPassword;
        }
        
        // store for next function call
        oldUsername = username;
        oldPassword = password;
        
    	salt = [184, 83, 26, 133, 22, 40, 115, 123, 141, 115,
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
    
    s.encrypt = function(username, password, data) {
        var key = s.clientPassword(username, password);
        return sjcl.encrypt(key, data);
    };
    
    s.decrypt = function(username, password, data) {
    	var key = s.clientPassword(username, password);
        return sjcl.decrypt(key, data);
    };
   
    
    
    return s;
}(s || {}));
/*
User module
===========

This module provides all functionality related
to the user login, registration and password
changing functionality. (It manages as well
the password list.)

The user is implemented as a singleton object.

*/

var s = (function(s) {
    // private constructor
    var User = function() {
        this.username = "";
        this.password = "";
        this.passwordList = {};
    };
    
    User.prototype.login = function(username, password) {
        this.username = username;
        this.password = password;
        
        s.retrieveData(username, this.serverPassword(), {
            onSuccess: this.setPasswordList.bind(this),
            
            
            
        });
    };
    
    User.prototype.serverPassword = function() {
    	return s.serverPassword(this.username, this.password);
    };
    
    User.prototype.clientPassword = function() {
        return s.clientPassword(this.username, this.password);
    };
        
    User.prototype.setPasswordList = function(data) {
        this.passwordList = s.decrypt(username,
        	this.clientPassword(),
            data        		         
        );
    }
        
        
    
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
    //   // if true, button is tyled as dangerous action (red)
    //   danger: bool,
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
/*
Input range subcomponent
========================

This subcompoenent representsa topcoat range input,
together with a display of the current value.

*/

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