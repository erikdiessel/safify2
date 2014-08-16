/*
Spec for s.helpers.filledForm
*/

describe("s.helpers.filledForm", function() {
	it("works with the google example (absolute url)", function() {
    	// form taken from accounts.google.com
    	var formHTML =
    '<form novalidate="" method="post" action="https://accounts.google.com/ServiceLoginAuth" id="gaia_loginform">'
  + '<input name="GALX" type="hidden" value="L3HYq">'
  + '<input name="continue" type="hidden" value="https://accounts.google.com/ManageAccount">'
  + '<input name="sacu" type="hidden" value="1">'
  + '<input name="acui" type="hidden" value="1">'
  + '<input type="hidden" id="_utf8" name="_utf8" value="☃">'
  + '<input type="hidden" name="bgresponse" id="bgresponse" value="js_disabled">'
  + '<input type="hidden" id="pstMsg" name="pstMsg" value="1">'
  + '<input type="hidden" id="dnConn" name="dnConn" value="">'
  + '<input type="hidden" id="myInput" name="checkConnection" value="youtube:113:1">'
  + '<input type="hidden" id="checkedDomains" name="checkedDomains" value="youtube">'
  + '<span id="reauthEmail" class="reauth-email">________</span>'
  + '<input id="Email" name="Email" type="email" class="email-input hidden" placeholder="Email" value="__________" spellcheck="false" readonly="">'
  + '<label class="hidden-label" for="Passwd">Password</label>'
  + '<input id="Passwd" name="Passwd" type="password" placeholder="Password" class="">'
  + '<input type="hidden" name="PersistentCookie" value="yes">'
  + '<input id="signIn" name="signIn" class="rc-button rc-button-submit" type="submit" value="Sign in">'
  + '</form>'
  
  		var form = s.helpers.filledForm(formHTML, "https://google.com",
        								"user123", "pa$$word");
        expect(form.querySelector('#Passwd').value).toEqual("pa$$word");
        // action as in original
        expect(form.action)
        	.toEqual("https://accounts.google.com/ServiceLoginAuth");
    });
    
    
    it("works with the heroku example (relative url)", function() {
    	var formHTML = 
        '<form action="/login" class="panel-body" method="post"><input name="_csrf" type="hidden" value="IwBG4xHS4RmimDPa1JOZwmZmjHj9zi+4fCwl1uTdViE="><fieldset><div class="field"><label for="email">Email</label><input class="text" id="email" name="email" placeholder="email address" tabindex="1" type="email"></div><div class="field"><label for="password">Password</label><input class="text password" id="password" name="password" placeholder="password" tabindex="2" type="password"></div></fieldset><fieldset class="submit"><p><a href="/account/password/reset">Reset Password</a></p><input class="submit" name="commit" tabindex="3" type="submit" value="Log In"></fieldset></form>';
        
        var form = s.helpers.filledForm(formHTML, "https://id.heroku.com",
        								"user123", "pa$$word");
        expect(form.querySelector('#email').value).toEqual("user123");
        expect(form.querySelector('#password').value).toEqual("pa$$word");
        expect(form.action).toEqual("https://id.heroku.com/login");
    })
});