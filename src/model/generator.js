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