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