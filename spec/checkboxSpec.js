define(['src/vendor/mithril', 'src/subcomponents/checkbox'],
function(m, checkbox) {

describe("The checkbox", function() {

	beforeEach(function(done) {
    	this.checked = m.prop(true);
        
    	m.render(document.body,
        	checkbox({
            	checked: this.checked,
                label: "My checkbox"
            })
        );
        
        this.checkbox = $("[type=checkbox]");
        this.label = $(":contains('My checkbox')");
        
        // Ensure that module is rendered by mithril
        setTimeout(done, 20);
    });

	it("is displayed", function() {
    	expect(this.checkbox.length).toBeGreaterThan(0);
    });
    
    it("has a label", function() {
    	expect(this.label.length).toBeGreaterThan(0);
    });

	it("the 'checked' property changes when clicked", function() {
    	expect(this.checked()).toBe(true);
        this.checkbox.click();
        expect(this.checked()).toBe(false);
    });
});

}); 