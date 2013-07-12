#!/usr/bin/env node

/*
Author : Saravanan Chinnappa
Task   : HW3_part2

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
var sys = require('util');
var rest = require('restler');
var async = require("async");

var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
//var URL_DEFAULT = "http://hidden-castle-9780.herokuapp.com";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

var checkURLHtmlFile = function(url, checksfile) {
    /*
    var urlHtml = rest.get(url).on('complete', function(result) {
  			if (result instanceof Error) {
    			  sys.puts('Error: ' + result.message);
    			  this.retry(5000); // try again after 5 sec
  			} else {
    			  sys.puts(result);
			  return result;
  			}
		  });

    $ = cheerio.load(urlHtml, {
        ignoreWhitespace: true
	});
    console.log('$ :', $);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
	console.log($(checks[ii]));
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    */
	async.series([
    		function(callback){
			rest.get(url).on('complete', function(result) {
  			if (result instanceof Error) {
    				sys.puts('Error: ' + result.message);
    				this.retry(5000); // try again after 5 sec
  			} else {
    				//return result;
       				callback(null,result); 
  			}
			});
    		},
	],
		// optional callback
		function(err, results){
			var out = {};
			var checks = JSON.parse(fs.readFileSync(checksfile));
    			$ = cheerio.load(results, {
        		ignoreWhitespace: true
			});
    			for(var ii in checks) {
        			var present = $(checks[ii]).length > 0;
        			out[checks[ii]] = present;
    			}
			var outJson = JSON.stringify(out, null, 4);
    			console.log(outJson);
		});
    //return out;
};
var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

function range(val) {
  return val.split('..').map(Number);
}

function list(val) {
  return val.split(',');
}

if(require.main == module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
        .option('-u, --url <app_url>', 'URL to heroku app')
        .parse(process.argv);
    if (program.url) {
        checkURLHtmlFile(program.url, program.checks);
    } else {
        var checkJson = checkHtmlFile(program.file, program.checks);
        var outJson = JSON.stringify(checkJson, null, 4);
        console.log(outJson);
    }
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
