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
    
    // helpers
    
    // create a unique username
    var randomUsername = function() {
        return "safify2-apiSpec-test-" +
        	Math.random().toString().substring(2,17);
    };
    
    var registerAndSave = function(username, password, data) {
        return s.registerUser(username, password)
        .otherwise(function() {/* everything o.k. */})
        .thereafter(s.savePasswordList(username, password, data))
        .otherwise(function() { /* everything o.k. */});
    };

    describe("s.registerUser", function() {
    	it("allows registering", function(done) {
        	var username = randomUsername();
        	var password = "pa$$word";
            
			s.registerUser(username, password)
            .onStatus(s.registerUser.OK_STATUS, function(data) {
            	expect(data).toEqual("Successfully registered");
                //done();
            }).thereafter(s.retrieveData(username, password))
            .onStatus(s.retrieveData.OK_STATUS, function(response) {
            	expect(response).toEqual("{}");
                done();
            }).otherwise(function(response) {
            	throw new Error("Error during the request, "
                	+ "with response: " + response);
                done();
            }).send();
        });
    });
    
    describe("registerAndSave", function() {
    	it("registers a user and then saves data", function(done) {
       		 var username = randomUsername();
             var password = "pa$$word";
             var data = "some important data"
             
             registerAndSave(username, password, data)
             .onStatus(s.savePasswordList.OK_STATUS, function(response) {
             	expect(response).toEqual("Successfully updated");
                done();
             }).otherwise(function(response) {
             	throw new Error("Error doing the request,"
                	+ " response: " + response);
             }).send();
        });
    });
    
    describe("s.savePasswordList", function() {
        it("allows to save data permanently", function(done) {
            var username = randomUsername();
        	var password = "pa$$word";
        	var data1 = "data1";
        
            registerAndSave(username, password, data1)
            .thereafter(s.retrieveData(username, password))
            .onStatus(s.retrieveData.OK_STATUS, function(response) {
            	expect(response).toEqual(data1);
                done();
            }).otherwise(function(response) {
            	throw new Error("Error during request, " 
                	+ " with response: " + response);
                done();
            }).send();
        });
        

    });
    
    describe("s.retrieveData", function() {
        
        it("executes error handler if password wrong", function(done) {
            var username = randomUsername();
            var password = "pas$$word";
            var data = "data";
            
            registerAndSave(username, password, data)
            .thereafter(s.retrieveData(username, "wrong_password"))
            .onStatus(s.retrieveData.AUTHENTIFICATION_FAILED_STATUS,
            function(response) {
            	expect(response).toEqual("Authentification failed");
                done();
            }).otherwise(function() {
            	throw new Error("Error during request");
                done();
            }).send();
        });        
    });
    
    describe("s.changeServerPassword", function() {
    	it("accepts only the new password after changing", function(done) {
        	var username = randomUsername();
            var firstPassword = "firstPa$$word";
            var secondPassword = "secondPa$$word";
            var data = "some_data";
            
            registerAndSave(username, password, data)
            .thereafter(
            	s.changeServerPassword(username, firstPassword, secondPassword)
            ).onStatus(s.changeServerPassword.OK_STATUS, function(response) {
            	expect(response).toEqual("Password changed")
            }).thereafter(s.retrieveData(username, secondPassword))
            // the new password works
            .onStatus(s.retrieveData.OK_STATUS, function(response) {
            	expect(response).toEqual(data);
            })
            // but the old password doesn't work
            .thereafter(s.retrieveData(username, firstPassword))
            .onStatus(
            	s.retrieveData.AUTHENTIFICATION_FAILED_STATUS,
                function(response) {
                	expect(response).toEqual("Authentification failed")
                    done();
                }
            ).otherwise(function(response) {
            	throw new Error("Error during request with response "
                	+ response);
                done();
            });
        });
    })
});