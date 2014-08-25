define(['src/localization/localized'], function(l) {

describe("The localization", function() {
    it("provides localized strings", function() {
        expect(l.password).toEqual("Password");
    });
    
    it("also from different sources", function() {
    	expect(l.length).toEqual("Length");
    	expect(l.username).toEqual("Username");
    });
});

});