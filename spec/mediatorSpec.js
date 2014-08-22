define(['src/framework/mediator'], function(md) {

describe("Mediator", function() {
	it("notifies other components about the event", function() {
    	var handleCatastrope = jasmine.createSpy();
    	md().on('catastrophe', handleCatastrope);
        // would normally be done in another component:
        md().pub('catastrophe');
        expect(handleCatastrope).toHaveBeenCalled();
    });
    
    it("passes along the additional information", function() {
    	var defend = jasmine.createSpy();
        md().on('attacked', defend);
        
        var place = "Epsilon Pegasi";
        md().pub('attacked', place);
        expect(defend).toHaveBeenCalledWith(place);
    });
    
    it("works with multiple subscribers", function() {
    	var callPolice = jasmine.createSpy();
        var callAmbulance = jasmine.createSpy();
        md().on('emergency', callPolice);
        md().on('emergency', callAmbulance);
        
        md().pub('emergency');
        expect(callPolice).toHaveBeenCalled();
        expect(callAmbulance).toHaveBeenCalled();
    });
    
    it("has the shortcut *publishing*", function() {
    	var loadWeapons = jasmine.createSpy();
        md().on('attacked', md().publishing('defending'));
        md().on('defending', loadWeapons);
        
        md().pub('attacked');
        expect(loadWeapons).toHaveBeenCalled();
    });
});

});