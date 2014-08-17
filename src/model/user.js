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
        this.entries = [];
    };
    
    User.prototype.login = function(username, password) {
        this.username = username;
        this.password = password;
        
        // TODO: login on server
        
//         s.retrieveData(username, this.serverPassword(), {
//             onSuccess: this.setPasswordList.bind(this),



//         });
    };
    
    User.prototype.serverPassword = function() {
    	return s.serverPassword(this.username, this.password);
    };
    
    User.prototype.clientPassword = function() {
        return s.clientPassword(this.username, this.password);
    };
        
    /* TODO: not finished implementation    
    User.prototype.setEntries = function(data) {
        this.passwordList = s.decrypt(this.username,
        	this.clientPassword(),
            data        		         
        );
    };
    */
    
    // Returns a copy of the entry with the specified index.
    // Changing values of the returned copy should not change
    // the original entry;
    User.prototype.getEntry = function(index) {
    	var entry = this.entries[index];
    	return {
        	title:    m.prop(entry.title),
        	username: m.prop(entry.username),
            password: m.prop(entry.password)
        };
    };
    
    // Sets the entry with the given *index* to the *newEntry*
    // *newEntry should store its attributes as m.prop-properties
    // It can therefore be used directly with User.getEntry
    User.prototype.setEntry
    = function(index/*::number*/, newEntry/*::Entry*/)/*::void*/ {
    	this.entries[index] = newEntry.serialize();
    };
    
    // Inserts *newEntry* in the entries list.
    // *newEntry* should store its attributes as m.prop-properties.
    User.prototype.addEntry = function(newEntry) {
    	this.entries.push(newEntry.serialize())
    };
    
    // Removes the entry with the specified index 
    // from the entries list
    User.prototype.deleteEntry =
    function(index/*::number*/)/*::void*/ {
    	this.entries.splice(index, 1);
    };
        
    s.user = User();    
    
    return s;
}(s || {}));