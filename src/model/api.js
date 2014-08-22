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