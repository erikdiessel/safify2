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
    
    var registerAndSave = function(username, password, data, done) {
    	if(done == undefined) {
        	throw "registerAndSave needs done parameter";
        }
        
        console.log(username);
    
    	return s.registerUser(username, password)
        	.then(s.savePasswordList.bind(this,
        		username, password, data),
                shouldNotBeCalled(done))   
    };
    
    // This function fails an expectation, if it is called.
    // Use it as a placeholder for error handling functions
    var shouldNotBeCalled = function(done) {
    	if(done == undefined ) {
        	throw "shouldNotBeCalled needs done parameter";
        }
    	return function(argument) {
            var isCalled = true;
            expect(argument).toEqual("notCalled");
            done();        
        };

    };
    
    
    describe("s.registerUser", function() {
    	it("allows registering", function(done) {
        	var username = randomUsername();
        	var password = "pa$$word";
        	
        	s.registerUser(username, password)
            .then(function(data) {
            	expect(data).toEqual("Successfully registered");
                done();
            }, shouldNotBeCalled(done));
        });
    });
    
    describe("registerAndSave", function() {
    	it("registers a user and then saves data", function(done) {
       		 var username = randomUsername();
             var password = "pa$$word";
             var data = "some important data"
             
             registerAndSave(username, password, data, done)
             .then(function(response) {
             	expect(response).toEqual("Successfully updated")
                done();
             }, shouldNotBeCalled(done));
        });
    });
    
    describe("s.savePasswordList", function() {
        it("allows to save data permanently", function(done) {
        	if(done == undefined) {
            	throw("it has undefined done");
            }
        
            var username = randomUsername();
        	var password = "pa$$word";
        	var data1 = "data1";
        
        	registerAndSave(username, password, data1, done)
        	.then(s.retrieveData.bind(this,
                	username, password, {}),
                shouldNotBeCalled(done)
           	).then(function(data) {
                expect(data).toEqual(data1);
                done();
            },
                shouldNotBeCalled(done)
            );
        });
        

    });
    
    describe("s.retrieveData", function() {
        
        it("executes error handler if password wrong", function(done) {
        	if(done == undefined) {
            	throw("it has undefined done");
            }
        
            var username = randomUsername();
            var password = "pas$$word";
            var data = "data";
            
            registerAndSave(username, password, data, done)
           	.then(s.retrieveData.bind(this, 
             		username, "wrong_password"),
            	shouldNotBeCalled(done)
            ).then(shouldNotBeCalled(done),
            	function(status) {
            		expect(status).toEqual(
                    	s.AUTHENTIFICATION_FAILED_STATUS
                    );
                    done();
                }
			);            
        });        
    });
});