/*eslint-env node*/

//------------------------------------------------------------------------------
// hello world app is based on node.js starter application for Bluemix
//------------------------------------------------------------------------------

// This application uses express as its web server
// for more info, see: http://expressjs.com
var express = require('express');
const url = require('url');
const quertstring = require('querystring');
const bodyParser = require('body-parser');

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');

// import the Watson Assistant webhook code so we can invoke it from here
const webhook = require('./webhook');

// create a new express server
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {

	// print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});

app.get("/webhook", async (req, res) => {

    let params1 = req.query.params;
    console.log("params = " + JSON.stringify(params1));
    console.log("command = " + params1.command);
    var params = {command:"testkey",
        swiftly_APIKey:"0a40989c036ae4dd601aff62bc9d1983"}
    console.log("calling webhook with params: " + JSON.stringify(params));
    var result = await webhook(params);
    console.log("webhook result = " + JSON.stringify(result));
    res.json(result);
})
