/*
Spec for the API interface (api.js)
===================================
*/

define(['src/model/api', 'src/framework/mediator'],
       function(api, md) {

describe("The API interface", function() {
    beforeEach(function() {
        // use integration database, so that we don't
        // pollute the production database with test fixtures
        api.set_API_BASE_URL(
            "https://safify-api-integration.herokuapp.com/"
        );
        // reset the subscriptions before each test, so
        // that there is no interference
        md().reset();
    });
    
    // helpers
    
    // create a unique username
    var randomUsername = function() {
        return "safify2-apiSpec-test-" +
        	Math.random().toString().substring(2,17);
    };
    
    var registerAndSave = function(username, password, data) {
        api.registerUser(username, password)
        md().on('loggedIn', function() {
        	api.savePasswordList(username, password, data);
        });
    };

    describe("registerUser", function() {
    	it("allows registering", function(done) {
        	var username = randomUsername();
        	var password = "pa$$word";
            
			api.registerUser(username, password);
            // Now check if registering worked
            md().on('loggedIn', function() {
            	api.retrieveData(username, password)
            });
			md().on('dataReceived', function(response) {
            	expect(response).toEqual("{}");
                done();
            })
        });
        
        it("publishes 'usernameUsed' if the username is in use", function(done) {
        	var username = randomUsername();
            var password = "pa$$word";
            
            api.registerUser(username, password);
            md().on('loggedIn', function() {
            	// try it a second time
            	api.registerUser(username, password);
            })
            md().on('usernameUsed', done);
        });
    });
    
    describe("the test helper registerAndSave", function() {
    	it("registers a user and then saves data", function(done) {
       		 var username = randomUsername();
             var password = "pa$$word";
             var data = "some important data"
             
             registerAndSave(username, password, data)
			 md().on('saved', done);
        });
    });
    
    describe("savePasswordList", function() {
        it("allows to save data permanently", function(done) {
            var username = randomUsername();
        	var password = "pa$$word";
        	var data1 = "data1";
        
            registerAndSave(username, password, data1)          
            md().on('saved', function() {
            	api.retrieveData(username, password)
            });            
            md().on('dataReceived', function(response) {
            	expect(response).toEqual(data1);
                done();
            });
        });        
    });
    
    describe("retrieveData", function() {
        it("publishes 'authentificationFailed' if password wrong",
        function(done) {
            var username = randomUsername();
            var password = "pas$$word";
            var data = "data";
            
            registerAndSave(username, password, data)
            md().on('saved', function() {
            	api.retrieveData(username, "wrong_password");
            });
            md().on('authentificationFailed', done);
        });        
    });
    
    describe("s.changeServerPassword", function() {
    	it("accepts only the new password after changing", function(done) {
        	var username = randomUsername();
            var firstPassword = "firstPa$$word";
            var secondPassword = "secondPa$$word";
            var data = "some_data";
            
            registerAndSave(username, firstPassword, data)
            md().on('saved', function() {
            	api.changeServerPassword(username,
                	firstPassword, secondPassword);
            });
            md().on('passwordSaved', function() {
            	api.retrieveData(username, secondPassword);
            });
            // the new password works
            md().on('dataReceived', function(response) {
            	expect(response).toEqual(data);
                api.retrieveData(username, firstPassword);
            })
            // but the old password doesn't work
            md().on('authentificationFailed', done);
        });
    });
});
});