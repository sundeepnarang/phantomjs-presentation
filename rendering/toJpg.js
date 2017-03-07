/**
 * Created by sundeepnarang on 3/7/17.
 */

var page = require('webpage').create();
page.open('https://google.com/', function() {
    page.render('google.jpg');
    phantom.exit();
});