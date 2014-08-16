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
    		  password/*::string*/)/*::MithrilPromise*/ {
        return new s.Request({
        	method: "GET",
            url: API_URL('passwords'),
            data: {
            	"username": username,
            	"password": password
            }
        });

    };
    
    // Additional constants for this functions, so
    // that clients don't have to hardcode status
    // codes.
    s.retrieveData.AUTHENTIFICATION_FAILED_STATUS = 401;
    s.retrieveData.USERNAME_NOT_FOUND_STATUS = 403;
    s.retrieveData.no_connection =
    function(status/*::number*/)/*::boolean*/ {
    	return status === 404 || status === 0;
    };
    

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
        });
    
    };

    // username: string
    // handlers: {
    // onUsernameFree: function
    // onUsernameUsed: function
    // }
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

    return s;
}(s || {}));
