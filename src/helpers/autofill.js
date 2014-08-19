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