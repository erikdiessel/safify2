define(['src/vendor/mithril', 'src/subcomponents/checkbox', '../helpers/jquery'],
function(m, checkbox, __) {

describe("The checkbox", function() {

	beforeEach(function(/*done*/) {
    	this.checked = m.prop(true);
        
    	m.render(document.body,
        	checkbox({
            	checked: this.checked,
                label: "My checkbox"
            })
        );
        
        this.checkbox = $("[type=checkbox]");
        this.label = $("label:contains('My checkbox')");
        
        // Ensure that module is rendered by mithril
        //setTimeout(done, 40);
    });

	it("is displayed", function() {
    	expect(this.checkbox.length).toBe(1);
    });
    
    it("has a label", function() {
    	expect(this.label.length).toBe(1);
    });

	it("the 'checked' property changes when clicked", function() {
    	expect(this.checked()).toBe(true);
        this.checkbox.click();
        expect(this.checked()).toBe(false);
    });
});

}); 