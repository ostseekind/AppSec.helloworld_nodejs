var expect  = require('chai').expect;
var request = require('request');

it('Main page content', function(done) {
    request('http://localhost:80/api' , function(error, response, body) {
        expect(body).to.equal('Hello World');
        done();
    });
});