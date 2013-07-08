#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest    = require('restler');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
	console.log("%s does not exist. Exiting.", instr);
	process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var assertUrlAccessible = function(url) {
   var bad = false;
/*
   rest.get(url).on('error', function(err, response) { 
     console.log("Error connecting to URL. Exiting.");
     process.exit(1);
   });*/
   return url;
};

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkFromUrl = function(url, checksfile) {

    //this doesn't  work. Why?
    rest.get('http://tait-sup.herokuapp.com').on('complete', function(result, response) { 
      if (result instanceof Error) {
        console.log(result.message);
        process.exit(1);
      }
      runChecksAndPrint(cheerio.load(result), checksfile);
    });
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    runChecksAndPrint($, checksfile);
};

var runChecksAndPrint = function($, checksfile) {
    var out = runChecks($, checksfile);
    var outJson = JSON.stringify(out, null, 4);
    console.log(outJson);
}

var runChecks = function($, checksfile) {
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
	var present = $(checks[ii]).length > 0;
	out[checks[ii]] = present;
    }
console.log('here'); 
    return out;
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

if(require.main == module) {
    program
	.option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
	.option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists))
	.option('-u, --url <url>', 'URL to check', clone(assertUrlAccessible))
	.parse(process.argv);

    var checkJson;
    if (program.file)
      checkHtmlFile(program.file, program.checks);
    else if (program.url)
      checkFromUrl(program.url, program.checks);
    else
      console.log("should do something here");

} else {
    exports.checkHtmlFile = checkHtmlFile;
}
