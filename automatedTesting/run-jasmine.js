/**
 * Created by sundeepnarang on 3/7/17.
 */

/**
================== IMPORTANT ==================

 This script is an update to support jasmine 2.5.2
 Original can be downloaded from :
 https://github.com/ariya/phantomjs/blob/master/examples/run-jasmine.js

 It may not work with eariler/later version of jasmine.

===============================================
 */

"use strict";
var system = require('system');

/**
 * Wait until the test condition is true or a timeout occurs. Useful for waiting
 * on a server response or for a ui change (fadeIn, etc.) to occur.
 *
 * @param testFx javascript condition that evaluates to a boolean,
 * it can be passed in as a string (e.g.: "1 == 1" or "$('#bar').is(':visible')" or
 * as a callback function.
 * @param onReady what to do when testFx condition is fulfilled,
 * it can be passed in as a string (e.g.: "1 == 1" or "$('#bar').is(':visible')" or
 * as a callback function.
 * @param timeOutMillis the max amount of time to wait. If not specified, 4 sec is used.
 */
function waitFor(testFx, onReady) {
    var maxtimeOutMillis = 4000, //< Default Max Timeout is 4s
        start = new Date().getTime(),
        condition = false,
        interval = setInterval(function() {
            if ( (new Date().getTime() - start < maxtimeOutMillis) && !condition ) {
                // If not time-out yet and condition not yet fulfilled
                condition = testFx();
            } else {
                if(!condition) {
                    // If condition still not fulfilled (timeout but condition is 'false')
                    console.log("'waitFor()' timeout");
                    phantom.exit(1);
                } else {
                    // Condition fulfilled (timeout and/or condition is 'true')
                    console.log("'waitFor()' finished in " + (new Date().getTime() - start) + "ms.");
                    onReady(); //< Do what it's supposed to do once the condition is fulfilled
                    clearInterval(interval); //< Stop this interval
                }
            }
        }, 100); //< repeat check every 100ms
};


if (system.args.length !== 2) {
    console.log('Usage: run-jasmine.js URL');
    phantom.exit(1);
}

var page = require('webpage').create();

// Route "console.log()" calls from within the Page context to the main Phantom context (i.e. current "this")
page.onConsoleMessage = function(msg) {
    console.log(msg);
};

page.open(system.args[1], function(status){
    if (status !== "success") {
        console.log("Unable to open " + system.args[1]);
        phantom.exit(1);
    } else {
        waitFor(function(){
            return page.evaluate(function(){
                return document.body.querySelector('.symbolSummary .jasmine-pending') === null && document.body.querySelector('.jasmine-results') !== null
            });
        }, function(){
            var exitCode = page.evaluate(function(){
                try {
                    console.log('');
                    console.log(document.body.querySelector('.jasmine-bar').innerText);
                    var list = document.body.querySelectorAll('.jasmine-failures .jasmine-spec-detail.jasmine-failed');
                    if (list && list.length > 0) {
                        console.log('');
                        console.log(list.length + ' test(s) FAILED:');
                        for (var i = 0; i < list.length; ++i) {
                            var el = list[i],
                                desc = el.querySelector('.jasmine-description'),
                                msg = el.querySelectorAll('.jasmine-result-message');
                            console.log('');
                            console.log('Error Description : ');
                            console.log(desc.innerText);
                            console.log('');
                            console.log('Error Messages : ');
                            for (var j = 0; j < msg.length; j++) {
                                console.log(msg[j].innerText);
                            }
                            console.log('');
                        }
                        return 1;
                    } else {
                        console.log("All Test Passed!");
                        return 0;
                    }
                } catch (ex) {
                    console.log(ex);
                    return 1;
                }
            });
            phantom.exit(exitCode);
        });
    }
});