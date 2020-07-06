/*eslint-env node*/

//------------------------------------------------------------------------------
// This web app is based on node.js starter application for IBM Cloud
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

// import the webhook code so we can invoke it from here
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

/* This endpoint allows this web application to serve as the Webhook for Watson Assistant implementations
* that need to make API calls to external services.
* The webhook endpoint below is just a pass-thru to the real logic that must be contained in a separate
* "webhook.js" module which is imported into this app.js module.
* Configure the Webhook in Watson Assistant to use a URL of "<application-route>/webhook"
* and be sure to configure the Content-Type to be "application/json" in the Webhook header setup.
* Note that Watson Assistant logic uses a POST request for webhook calls.
* This endpoint is declared async because most often the ultimate API call (implemented in webhook.js)
* will be an asynchronous Promise. Unless this endpoint waits for the Promise to be resolved, it will
* return to the virtual assistant before the underlying API call completes.
*/
app.post('/webhook', async (req, res) => {
    // copy params passed in from external POST request
    var params = req.body;
    // log before and after invoking the real webhook logic
    console.log("calling webhook logic with params: " + JSON.stringify(params));
    var result = await webhook(params);
    console.log("webhook result = " + JSON.stringify(result));
    res.json(result);
});
