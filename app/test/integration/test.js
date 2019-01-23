
var assert = require('chai').assert;
var fs = require('fs');
var webdriver = require('selenium-webdriver');
var By = webdriver.By;

driver = new webdriver.Builder().
    usingServer('http://selenium.service.lidop.local:8091/wd/hub').
    // usingServer('http://10.20.30.40:8091/wd/hub').
    withCapabilities({'browserName': 'chrome'}).
    build();

describe("Demo Tests", function(){
    before(function(){
        var mode = 0777 & ~process.umask();
        fs.mkdir('.results', mode, function(err){ console.log(err); });   
        var site = "http://helloworldnodejs.service.lidop.local:9100/";
        //var site = "http://10.20.30.40:9100/";
        console.log('Open website: ' + site);
        return driver.get(site);    
    });
 
    after(function(done){ 
        console.log('Close website');
        driver.quit();
        done();
    });
    
    beforeEach(function(){        
    });
 

    afterEach(function(done){
        var name = this.currentTest.title;
        driver.takeScreenshot().then(
            function(image, err) {
                fs.writeFile(".results/" + name + '.png', image, 'base64', function(err) {
                    console.log(err);
                });
                done();
            }
        );
    });
  
    it("Test Title", function(done){
        driver.getTitle()
            .then(title => {
                console.log("Title: " + title);
                assert.equal("LiDOP", title);
            })
            .then(done);
    });

    it('Test Content', function (done) {
        driver.findElement(By.css('h1'))
            .then(elem => elem.getText() )
            .then(text => {
                console.log("Text: " + text);
                assert.equal(text, 'Hello LiDOP!');
            })
            .then(done);
        });
});
