define(['src/model/generator'], function(generatePassword) {

describe("The password generator function s.generatePassword", function() {
	it("generates a password with the specified parameters", function() {
        // password only with lowercase letters
        var password1 = generatePassword(6, false, false, false);
        expect(password1.length).toEqual(6);
        expect(password1).toMatch(/^[a-z]+$/);
        
        // password with uppercase letters
        var password2 = generatePassword(8, true, false, false);
        expect(password2.length).toEqual(8);
        expect(password2).toMatch(/^([a-z]|[A-Z])+$/);
        
        // password with numbers
        var password3 = generatePassword(7, false, true, false);
        expect(password3.length).toEqual(7);
        expect(password3).toMatch(/^([a-z]|[0-9])+$/);
        
        // password with special characters
        var password4 = generatePassword(10, false, false, true);
        expect(password4.length).toEqual(10);
        expect(password4).toMatch(
            // special characters and letters from a-z
            // (have to be escaped)
            /^([\!\$\%\&\/\(\)\=\?\+\-\*\{\}\[\]a-z])+$/
        );
    });
    
    it("generates always a new password", function() {
        var password1 = generatePassword(5, false, false, false);
        var password2 = generatePassword(5, false, false, false);
        
        expect(password1).not.toEqual(password2);
    })
});
});