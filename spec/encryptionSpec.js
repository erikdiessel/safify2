define(['src/model/security'], function(security) {


describe("Encryption and decryption", function() {
   it("are inverses of each other", function() {
       var data = "very, very secret";
       var username = "someUser13";
       var password = "pa$$word13aaaaaaaaaaaaaaaa";
       
       var encrypted = security.encrypt(username, password, data);
       
       var decrypted = security.decrypt(username, password, encrypted);
       
       expect(decrypted).toEqual(data);
   }) 
});

});