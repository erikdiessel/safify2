describe("The password computation", function() {
    
    describe("The client password", function() {
        it("has the same values as version 1 of safify", function() {
            var username = "user77";
            var password = "pa$$word77"
            var computed = s.clientPassword(username, password);

            expect(computed).toEqual(JSON.stringify([
                // test vector from the old safify
                -1982764885, -50145425, 567454865, -1685413162,
                393946872, 107651544, 217193540, 661534357
            ]));
        });
        
        it("is only computed once and then stored", function() {
            var username = "user77";
            var password = "pa$$word77"
            var computed = s.clientPassword(username, password);
            for(var i=0; i<100; i++) {
                // should be now really fast
                var computed2 = s.clientPassword(username, password);
                expect(computed2).toEqual(computed);
            };
        });
    });
    
    describe("The server password", function() {
        it("has the same values as version 1 of safify", function() {
            var username = "user77";
            var password = "pa$$word77"
            var computed = s.serverPassword(username, password);

            expect(computed).toEqual(JSON.stringify([
                // test vector from the old safify
                808620036, -2141772994, -1595393354, -693473384,
                25759772, 1503502950, -44178838, -1463339941
            ]));
        });
        
       it("is only computed once and then stored", function() {
            var username = "user77";
            var password = "pa$$word77"
            var computed = s.serverPassword(username, password);
            for(var i=0; i<100; i++) {
                // should be now really fast
                var computed2 = s.serverPassword(username, password);
                expect(computed2).toEqual(computed);
            };
        });
        
    })
});