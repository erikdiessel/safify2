/*
Spec for the API interface (api.js)
===================================
*/

describe("The API interface", function() {
    beforeEach(function() {
        // use integration database, so that we don't
        // pollute the production database with test fixtures
        s.API_BASE_URL =
            "https://safify-api-integration.herokuapp.com/";
    });
    
    afterEach(function() {
        // revert back to the original database,
        // for safety
        s.API_BASE_URL = "https://safify-api.herokuapp.com/";
    });
    
    // helpers
    
    // create a unique username
    var randomUsername = function() {
        return "safify2-apiSpec-test-" +
        	Math.random().toString().substring(2,17);
    };
    
    var registerAndSave = function(username, password, data) {
    	return s.registerUser(username, password)
        		.then(_.partial(s.savePasswordList,
        			username, password, data));	    
    };
    
    describe("s.savePasswordList", function() {
        it("allows to save data permanently", function(done) {
            var username = randomUsername();
        	var password = "pa$$word";
        	var data1 = "data1";
        
        	registerAndSave(username, password, data1)
        		.then(_.partial(s.retrieveData, username, "wrong", {}))
        		.then(function(data) {
        			expect(data).toEqual(data1);
        			done();
    			});
        });
        

    });
    
    describe("s.retrieveData", function() {
        
        it("executes error handler if password wrong", function(done) {
            var username = randomUsername();
            var password = "pas$$word";
            var data = "data";
            
            var spy = jasmine.createSpy();
            
            registerAndSave(username, password)
            	.then(_.partial(s.retrieveData,
                     	username, "wrong_password",
                     	{ onAuthentificationFailed: spy }))
            	.then(function() {
                    expect(spy).toHaveBeenCalled();
                    done();
                });
            
        });        
    });
});