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

function checkUsernamePassword(username, password) {
    if (username == "") {
        md.pub('usernameMissing');
        return false;
    } else if (password == "") {
        md.pub('passwordMissing');
        return true;
    } else {
        return true;
    }
}

md().on('login', function(username, password) {
    /* Since we do an asynchronous call and want to show (in case)
       all error messages, we have to signalize Mithril the start
       of an asynchronous call. This is later resolved in the 
       errorMessages - module with m.endComputation, such that a
       redraw is triggered. In the case of no existing error messages
       we signalize the end with m.endComputation inside dataReceived
    */
    if (checkUsernamePassword(username, password)) {
        m.startComputation();

        _username = username; _password = password;
        var serverPassword = security.serverPassword(_username, _password);
        api.retrieveData(username, serverPassword);
    }
});

md().on('register', function(username, password) {
    if (checkUsernamePassword(username, password)) {
        _username = username; _password = password;
        var serverPassword = security.serverPassword(_username, _password);
        api.registerUser(_username, serverPassword);
    }
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