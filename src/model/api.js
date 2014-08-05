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
var s = (function (s) {
    // exposed as public constant, so that it can
    // be mocked for tests
    s.API_BASE_URL = "https://safify-api.herokuapp.com/";

    // This private function returns the url for
    // a specific path of the API
    var API_URL = function (path) {
        // important: use https:// protocol
        return s.API_BASE_URL + path;
    };

    // Helper function which returns the URL encoding of
    // the object.
    var toURLEncoding = function (obj) {
        return Object.keys(obj).map(function (prop) {
            return encodeURIComponent(prop) + "=" + encodeURIComponent(obj[prop]);
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
    s.retrieveData = function (username, password, handlers) {
        var request = new XMLHttpRequest();

        // Make an async request to the endpoint /passwords
        // with the parameters:
        // 		username: username
        // 		password: serverPassword
        request.open('GET', API_URL('passwords') + "?" + toURLEncoding({
            "username": username,
            "password": password
        }));

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

        request.onload = function () {
            // execute the handler belonging to the
            // status code
            return {
                "200": deferred.resolve,
                "401": handlers.onAuthentificationFailed,
                "403": handlers.onUsernameNotFound,
                "404": handlers.onNoConnection,
                // status 0 is used when there is no internet
                // connection available
                "0": handlers.onNoConnection
            }[request.status](request.responseText);
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
    s.registerUser = function (username, password) {
        var request = new XMLHttpRequest();
        request.open('POST', API_URL('register'), true);
        request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

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
    s.checkForUsername = function (username, handlers) {
        var request = new XMLHttpRequest();
        request.open('GET', API_URL('username_not_used') + "?" + toURLEncoding({ "username": username }));

        request.onload = function () {
            // call to status code corresponding handler
            return {
                200: handlers.onUsernameFree,
                409: handlers.onUsernameUsed }[request.status]();
        };

        request.send();
    };

    // Changes the password for authentification on the server
    // to a new one.
    // username: string
    // oldPassword: string   password used before
    // newPassword: string
    // callback: function    triggered when the request completes
    s.changeServerPassword = function (username, oldPassword, newPassword, callback) {
        var request = new XMLHttpRequest();
        request.open('POST', API_URL('change_password'));
        request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        request.onload = callback;
        request.send(toURLEncoding({
            "username": username,
            "password": oldPassword,
            "new_password": newPassword
        }));
    };

    // data: string    The password list to save
    // callback: function     Executed when the request completes
    s.savePasswordList = function (username, password, data) {
        var request = new XMLHttpRequest();
        request.open('POST', API_URL('passwords'));
        request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

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
