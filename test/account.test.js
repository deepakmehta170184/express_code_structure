"use strict";

import supertest from  "supertest";
import should from  "should";

var apiMain = supertest.agent("{{host}}");

let body= { "accountEmail": "subscription1@gmail.com"}
describe("create Subscription Account", function() {
    this.timeout(10000);
  
    it.only("# Test the create Subscription Account", function(done) {
      apiMain
        .post("/account/createSubscriptionAccount")
        .send(body)
        .set("Content-Type",'application/x-www-form-urlencoded')
        //.set('Authorization', '{AuthTokenValue}')
        .expect(200)
        .end(function(err, res) {
          if (err) {
            return done(err); 
          }
           var data=JSON.parse(res.text);
           //data.should.have.property("listingsId");
           done();
        });
    });
});



