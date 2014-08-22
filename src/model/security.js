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