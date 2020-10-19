/**
  *
  * The top-level exported function will be run when you invoke this module from
  * the app.js module.
  *
  * @params These webhook command functions accept a single parameter, which must be a JSON object.
  * @params.command = command passed in telling this webhook which subfunction to invoke
  *
  * @return The output of the command, which must be a JSON object.
  *
  */
const needle = require('needle');
const fetch = require('node-fetch');
global.Headers = fetch.Headers;
var debug = false;

/* The main function just serves to determine which command has been requested by the calling code.
    Based on the value of params.command passed in, a sub-function is invoked by this main function.
*/
module.exports = function (params) {
    if (params.debug != null && params.debug == "true"){
      debug = true;
    }
    var command = params.command;

    if (command === "testkey"){
        console.log('Command recognized: ' + command );
        return testkey(params);
    }
    else if (command === "predictions"){
        console.log('Command recognized: ' + command );
        return predictions(params);
    }
    else if (command === "routes"){
        console.log('Command recognized: ' + command );
        return routes(params);
    }
    else if (command === "vehicles"){
        console.log('Command recognized: ' + command );
        return vehicles(params);
    }
    else if (command === "location_predictions"){
        console.log('Command recognized: ' + command );
        return location_predictions(params);
    }
    else if (command === "engage"){
        console.log('Command recognized: ' + command );
        return engage(params);
    }
    else if (command === "identify_language"){
        console.log('Command recognized: ' + command );
        return identify_language(params);
    }
    else {
	    return { message: 'Command not recognized: ' + command };
    }
}

/* The predictions sub-function invokes the Swiftly API.
    @params.swiftly_APIKey is required for authorization to use the Swiftly API
    @params.stopcode is required in order to identify the stop for which predictions are requested.
    @params.debug is not required. If provided, it's value controls the log output from the webhook.
*/
async function predictions (params){
    // easy debug printout
    console.log("entering predictions function");
    var routes = "";
    var utctime = "";

    // build url with query parameters for API call
    var url="https://api.goswift.ly/real-time/san-antonio/predictions?number=2&stop=" + params.stopcode;

    // perform API call using needle default Promise format
    let response = await needle('get', url, { headers: { authorization: params.swiftly_APIKey } });

    // format the routes information returned by the API call
    for (i in response.body.data.predictionsData){
        // add route name
        routes = routes + "<b>" + response.body.data.predictionsData[i].routeName + "</b>\n";

        // add all destinations for the route
        for (j in response.body.data.predictionsData[i].destinations) {
            routes = routes + "<i>To</i>: " + response.body.data.predictionsData[i].destinations[j].headsign + "\n";

            // add times (one or more) for each destination
            routes = routes + "At: ";
            var lasttime = Object.keys(response.body.data.predictionsData[i].destinations[j].predictions).length - 1;
            for (k in response.body.data.predictionsData[i].destinations[j].predictions){
                utctime = response.body.data.predictionsData[i].destinations[j].predictions[k].time;
                routes = routes + format_date(utctime);
                if (k == lasttime) {routes = routes + "\n";} // newline after last time for destination
                else {routes = routes + " & ";} // if not last time for destination, put ampersand and add next time
            }
        }
        // add a blank line in between each route
        routes = routes + "\n";
    }

    // return stop name and formatted routes information
    var result = {  "stopName": response.body.data.predictionsData[0].stopName,
                    "routes": routes,
                    "rawdata": response.body.data.predictionsData
                 };

    return result;
}

/* The routes sub-function is not yet implemented.
    @params.swiftly_APIKey is required for authorization to use the Swiftly API
    @params.route is required in order to identify the route for which information is requested.
    @params.debug is not required. If provided, it's value controls the log output from the webhook.
*/
async function routes (params){
    console.log("entering routes function");
    var url="https://api.goswift.ly/real-time/san-antonio/routes?route=" + params.route;

    let response = await needle('get', url, { headers: { authorization: params.swiftly_APIKey } });

    return { body: response.body };
}

/* The vehicles sub-function s not yet implemented.
    @params.swiftly_APIKey is required for authorization to use the Swiftly API
    @params.route is required in order to identify the route for which vehicle information is requested.
    @params.debug is not required. If provided, it's value controls the log output from the webhook.
*/
async function vehicles (params){
    console.log("entering vehicles function");
    var url="https://api.goswift.ly/real-time/san-antonio/vehicles?route=" + params.route;

    let response = await needle('get', url, { headers: { authorization: params.swiftly_APIKey } });

    return { body: response.body };
}

/* The location_predictions sub-function is not yet implemented.
    @params.swiftly_APIKey is required for authorization to use the Swiftly API
    @params.lat is required in order to identify the latitude value for the API call.
    @params.lon is required in order to identify the longitude value for the API call.
    @params.debug is not required. If provided, it's value controls the log output from the webhook.
*/
async function location_predictions (params){
    console.log("entering location_predictions function");
    var url;
//    url="https://api.goswift.ly/real-time/san-antonio/predictions-near-location?lat=" + params.lat + "&lon=" = params.lon;

    let response = await needle('get', url, { headers: { authorization: params.swiftly_APIKey } });

    return { body: response.body };
}

/* The tesapi sub-function invokes the Swiftly API test-key method.
    This just tests that the Swiftly API key works and that it is possible to invoke the Swiftly API successfully.
    @params.swiftly_APIKey is required for authorization to use the Swiftly API
*/
async function testkey (params){
    console.log("entering testkey function");

    let response = await needle('get', `https://api.goswift.ly/test-key`,
        { headers: { authorization: params.swiftly_APIKey } });

    let body = response.body;
    if (debug) console.log("testkey result: " + JSON.stringify(body));
    return { body: response.body };

}

/* The identify_language sub-function invokes the Watson Language Translator API identify method.
    @params.apikey is required for authorization to use the Watson API
    @params.url is required for the API call
    @params.text is the text for which the language is to be identified.
    @params.debug is not required. If provided, it's value controls the log output from the webhook.
*/
async function identify_language (params){
    console.log("entering identify_language function");
    const LanguageTranslatorV3 = require('ibm-watson/language-translator/v3');
    const { IamAuthenticator } = require('ibm-watson/auth');

    const languageTranslator = new LanguageTranslatorV3({
      version: '2018-05-01',
      authenticator: new IamAuthenticator({
        apikey: params.apikey,
      }),
      url: params.url,
    });

    const identifyParams = { text: params.text };
    var theLanguage = {language:""};

    if (debug) console.log("\ncalling the LT identify API with:",identifyParams);
    await languageTranslator.identify(identifyParams)
      .then(identifiedLanguages => {
        console.log("\nEvaluation done. Language identified: ", JSON.stringify(identifiedLanguages.result.languages[0].language));
        theLanguage.language = identifiedLanguages.result.languages[0].language;
      })
      .catch(err => {
        console.log('error:', err);
      });

 return theLanguage;
}

/* The getAssistantConversation sub-function invokes the Watson Assistant  API
  in order to capture the history of all messages that were part of the conversation
  prior to when the user requested a live agent callback.
    @params.apikey is required for authorization to use the Watson API
    @params.url is required for the API call
    @params.debug is not required. If provided, it's value controls the log output from the webhook.
*/
async function getAssistantConversation(params) {
  if (debug) console.log("enter getAssistantConversation method");
  const AssistantV1 = require('ibm-watson/assistant/v1');
  const { IamAuthenticator } = require('ibm-watson/auth');
  var sps_messages = [];
  const assistant = new AssistantV1({
    version: '2020-04-01',
    authenticator: new IamAuthenticator({
      apikey: params.apikey,
    }),
    url: params.url,
  });

  // get the timestamp for 30 minutes ago to use in the request filter
  var date = new Date(Date.now() - (30 * 60000));
  var dateString = date.toISOString();
  if (debug) console.log("filter date string: " + dateString);
  // set the filter to capture all conversations with this user within the past 30 minutes
  var filter_string =
    "[customer_id::" + params.conversation_id + ",response_timestamp>=" + dateString + "]";
  const list_params = {
    workspaceId: params.workspace_id,
    filter: filter_string
  };

  if (debug) console.log("\nlistLogs params",list_params);
  await assistant.listLogs(list_params)
    .then(res => {
      //if (debug) console.log("\nraw log request result:", JSON.stringify(res.result, null, 2));
      // go through each Watson Assistant response and pull out input text & output text
      var sps_msg_counter = 0;
      for (i in res.result.logs) {
        // first get the user input text
        //if (debug) console.log("\nuser input:", res.result.logs[i].response.input.text);
        //if (debug) console.log("time of user input:",res.result.logs[i].request_timestamp);
        if (res.result.logs[i].response.input.text != ""){
            sps_messages[sps_msg_counter] = formatMessage(true,
                                        res.result.logs[i].response.input.text,
                                        res.result.logs[i].request_timestamp
                                        );
            if (debug) console.log("\nmessage:", sps_messages[sps_msg_counter]);
            sps_msg_counter = sps_msg_counter + 1;
        }

        // now get all of the response output text from Watson Assistant
        // there may be more than one response from WA, so capture them all
        var response_text = "";
        for (j in res.result.logs[i].response.output.text) {
          //if (debug) console.log("assistant response: ", res.result.logs[i].response.output.text[j]);
          response_text = response_text + res.result.logs[i].response.output.text[j];
        }
        // and add the time of the response
        //if (debug) console.log("date:",res.result.logs[i].response_timestamp);
        if (response_text != "") {
            sps_messages[sps_msg_counter] = formatMessage(false,
                                        response_text,
                                        res.result.logs[i].response_timestamp
                                        );
            if (debug) console.log("\nmessage:", sps_messages[sps_msg_counter]);
            sps_msg_counter = sps_msg_counter + 1;
        }
      }

    })
    .catch(err => {
      console.log(err)
    });

    return sps_messages;
}

/*
* The formatMessage function takes in the 3 components of a message object to be sent
* to the SPS Digital engage API and returns a message object formatted properly
* for that API call.
*/
function formatMessage(msg_in, msg_text, msg_date){
  //if (debug) console.log("enter formatMessage function");
  sps_message = {"inbound":msg_in,
                  "text":msg_text,
                  "date": msg_date
                };
  //if (debug) console.log("sps_message:",JSON.stringify(sps_message));
  return sps_message;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/* The engage command function invokes the SPS Digital Engage webhook API.
    Documentation for this API can be seen at:
          https://engage.spsdgtl.com/docs/webhooks#post-webhooks-nativechat
    The engage API registers a user to have someone from VIA's support team contact them later.

    @params.auth_token is required for authorization to use the SPS Digital API
    @params.user_firstname is a required string containing the user's first name
    @params.user_lastname is a required string containing the user's last name
    @params.email is an optional string containing the user's email address
    @params.phone is an optional string containing the user's phone number in E.164 format (https://www.twilio.com/docs/glossary/what-e164)

    Either the email or the phone must be supplied or the call will fail.
    But both are not required, as long as one is supplied.

    @params.language is required to identify the language of the conversation.
    @params.conversation_id is required as the token associated with the user's conversation.
    @params.apikey is a required value for the Watson Assistant API Key.
    @params.url is a required string holding the url for the Watson Assistant API.
    @params.workspace_id is a required value that identifies the Watson Assistant workspace (Skill).
    @params.debug is not required. If provided, it's value controls the log output from the webhook.
*/
async function engage(params) {
    console.log("enter engage function");

    if (debug) console.log("\nconversation_id", params.conversation_id);

    // add a delay to ensure that all messages have been recorded in Watson Assistant
    await sleep(2000);
    if (debug) console.log("before call to WA");
    let sps_messages = await getAssistantConversation(params);
    //if (debug) console.log("\nsps_messages", JSON.stringify(sps_messages));

    // set up http request headers
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", params.auth_token);

    var lang = "en";
    if (params.language == "spanish"){
      lang = "es";
    }
    // create request body using input parameters
    var raw = JSON.stringify({"messages": sps_messages,
                              "user":{
                                "firstName": params.user_firstname,
                                "lastName": params.user_lastname,
                                "email": params.email,
                                "phone": params.phone
                              },
                              "language":lang
                            });
    //if (debug) console.log("\nraw", raw);

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };
    if (debug) console.log("\nrequestOptions", requestOptions);

    // create return object with fields for status and also error return info
    var returnobj = {
        "status": "",
        "statusText": "",
        "errorCode": "",
        "errorMessage": ""
    };

    // make the API call
    let response = await fetch("https://engage.spsdgtl.com/webhooks/nativechat", requestOptions);
    // !!!! temp hack to simulate API call during development !!!
    // var response = {status:"200", statusText:"OK", ok:true};

    // set the return status values - note that fetch basically NEVER fails, so you have to check the status value
    returnobj.status = response.status;
    returnobj.statusText = response.statusText;
    if (debug) console.log("\nreturn status:", response.status, response.statusText);

    if ( !response.ok ) {
        if (debug) console.log("\nAPI call failed!");
        let errorDetail = await response.json();
        if (debug) console.log("\nerror info:",errorDetail.errors[0].code,errorDetail.errors[0].message);
        returnobj.errorCode = errorDetail.errors[0].code;
        returnobj.errorMessage = errorDetail.errors[0].message;
    }

    return returnobj;
}

/* The format_date sub-function extracts the time in AM/PM format from a Date object
*/
function format_date(utctime){
    var date = new Date(utctime * 1000);
    var time = date.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true, timeZone: 'America/Chicago' });
    return time;
}
