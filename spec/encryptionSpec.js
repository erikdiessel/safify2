describe("Encryption and decryption", function() {
   it("are inverses of each other", function() {
       var data = "very, very secret";
       var username = "someUser13";
       var password = "pa$$word13";
       
       var encrypted = s.encrypt(username, password, data);
       
       var decrypted = s.decrypt(username, password, encrypted);
       
       expect(decrypted).toEqual(data);
   }) 
});