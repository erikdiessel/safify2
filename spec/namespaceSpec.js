/*
Test for the function *namespace()*
*/

describe('namespace', function() {
	it('creates the namespace, when not already defined', function() {
    	namespace('newModule.newPart.Feature1');
        expect(newModule.newPart.Feature1).toBeDefined();
    });
    
    it("doesn't overwrite the namespace", function() {
    	namespace('newModule');
        newModule = 43;
        namespace('newModule'); // should do nothing
        expect(newModule).toEqual(43);
    });
});