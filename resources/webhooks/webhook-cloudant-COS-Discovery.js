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
const Cloudant = require('@cloudant/cloudant');
const vcap = require('./bx_creds.json');
var ibm = require('ibm-cos-sdk');
var util = require('util');
var csv = require('jquery-csv');

/* The main function just serves to determine which command has been requested by the calling code.
    Based on the value of params.command passed in, a sub-function is invoked by this main function.
*/
module.exports = function (params) {
    if (params.debug != null && params.debug == "true"){
      debug = true;
    }
    var command = params.command;

    if (command === "registrar_lookup"){
        console.log('Command recognized: ' + command );
        return registrar_lookup(params);
    }
    else if (command === "early_voting_lookup"){
        console.log('Command recognized: ' + command );
        return early_voting_lookup(params);
    }
    else if (command === "early_voting_lookup2"){
        console.log('Command recognized: ' + command );
        return early_voting_lookup2(params);
    }
    else if (command === "early_voting_lookup_cos"){
        console.log('Command recognized: ' + command );
        return early_voting_lookup_cos(params);
    }
    else {
	    return { message: 'Command not recognized: ' + command };
    }
}

/* The registrar_lookup sub-function invokes the Cloudant API.
    @params.parish_name is required and is the parish name to be looked up in the Cloudant la_registrar_lookup database.
    @params.debug is not required. If provided, it's value controls the log output from the webhook.
*/
async function registrar_lookup (params){
    console.log("entering registrar_lookup function");

    var cloudant_url = "https://5117d004-a701-4751-bea9-5a91cf6b6e3b-bluemix.cloudantnosqldb.appdomain.cloud";

    var cloudant = await Cloudant({ url: cloudant_url, plugins: { iamauth: { iamApiKey: 'lmhMyPWxcrgPlrjuPzoVq54PCI0djJTzqIhd9P6rmh7n' } } });

    var db = await cloudant.db.use("la-registrar-lookup");

    var parish = params.parish_name.toUpperCase();
    var q = {
        "selector": {
            "parish_name": {
                "$regex": parish
            }
        },
        "fields": [
         "parish_name",
         "office_title",
         "physical_location",
         "direction_link",
         "mailing_address",
         "phone",
         "fax",
         "email"
      ],
      "sort": [
         {
            "parish_name": "asc"
         }
      ]
    };

    if (debug) console.log("before query");

    var answer = "";
    var result;
    try {
        //result = await executeQuery(db, q);
        result = await db.find(q);
    }
    catch (err){
        console.log("Error: ",err);
    }
    for (i in result.docs){
        if (debug) console.log("doc"+i+" :",result.docs[i]);
        if (i == 0) {
            answer = answer + "<b>" + result.docs[i].office_title + "</b><br />";
        }
        answer = answer + "<br /><b>Physical Location:</b><br />" + result.docs[i].physical_location;

        answer = answer + "<a target=\"_blank\" href=\"" + result.docs[i].direction_link + "\">Get directions</a><br /><br />";

        answer = answer + "Mailing Address:\n" + result.docs[i].mailing_address + "<br />";
        answer = answer + "Phone:\t" + result.docs[i].phone + "<br />";
        answer = answer + "Fax:\t" + result.docs[i].fax + "<br />";
        answer = answer + "Email:\t" + result.docs[i].email + "<br />";
    }
    if (debug) console.log(answer);

    var response = {answer:answer};

    return response;
}

/* The early_voting_lookup2 sub-function invokes the Discovery Service API.
    @params.parish is required and is the parish name to be looked up in the Discovery Collection.
    @params.debug is not required. If provided, it's value controls the log output from the webhook.
*/
async function early_voting_lookup2 (params){
    console.log("entering early_voting_lookup2 function");

    const DiscoveryV1 = require('ibm-watson/discovery/v1');
    const { IamAuthenticator } = require('ibm-watson/auth');

    const discovery = new DiscoveryV1({
      version: '2019-04-30',
      authenticator: new IamAuthenticator({
        apikey: 'TPRmMPlJVdnq1-_oCgZGG_8baX3PMpfddZNufnJ9_2Nz',
      }),
      serviceUrl: 'https://api.us-south.discovery.watson.cloud.ibm.com/instances/619d1adb-4c39-4de5-b284-0a3288a44e19',
    });

    const queryParams = {
      environmentId: '4ac75b67-8af5-4637-9287-68d88defbe5f',
      collectionId: '8673c8bc-8585-48e9-b2f0-828ffc8dbb08',
      query: params.parish
    };

    var answer = "<b>Early Voting Locations for\n" + params.parish + " Parish:</b>\n";
    var result;
    if (debug) console.log("before query");
    await discovery.query(queryParams)
      .then(queryResponse => {
        console.log(JSON.stringify(queryResponse, null, 2));
        for (i in queryResponse.result.results) {
            answer = answer +
                queryResponse.result.results[i].location;
        }
      })
      .catch(err => {
        console.log('error:', err);
      });

    var response = {answer:answer};

    return response;
}

/* The getParamsCOS sub-function is called by the early_voting_lookup_cos function
   and does the work of establishing a IBM Cloud Object Storage (COS) connection.
   This code came from the IBM Cloud Function JS library for COS actions.
*/
function getParamsCOS(args, COS) {
  const { bucket, key } = args;
  const endpoint = args.endpoint || 's3-api.us-geo.objectstorage.softlayer.net';
  const ibmAuthEndpoint = args.ibmAuthEndpoint || 'https://iam.cloud.ibm.com/identity/token';
  const apiKeyId = args.apikey || args.apiKeyId || args.__bx_creds['cloud-object-storage'].apikey;
  const serviceInstanceId = args.resource_instance_id || args.serviceInstanceId || args.__bx_creds['cloud-object-storage'].resource_instance_id;

  const params = {};
  params.bucket = bucket;
  params.key = key;

  const cos = new COS.S3({
    endpoint, ibmAuthEndpoint, apiKeyId, serviceInstanceId,
  });
  return { cos, params };
}

/* The early_voting_lookup_cos sub-function invokes the IBM Cloud Object Storage (COS) API.
    @params.parish is required and is the parish name to be looked up in the COS JSON table.
    @params.debug is not required. If provided, it's value controls the log output from the webhook.
*/
async function early_voting_lookup_cos (params){
    console.log("entering early_voting_lookup_cos function");

    // establish connection to IBM Cloud Object Storage (COS)
    const CloudObjectStorage = require('ibm-cos-sdk');
    args = require('./bx_creds.json');
    const { cos, params2 } = getParamsCOS(args, CloudObjectStorage);

    // read entire data.json file containing early voting location table
    let response;
    parish_UC = params.parish.toUpperCase();
    const result = {location:"<b>Early Voting Locations for<br />" + parish_UC + " Parish:</b><br />"};
    try {
      response = await cos.getObject({ Bucket: "stateoflouisianavoterassistantpro-donotdelete-pr-vbbotmryvtuu00", Key: "data.json" }).promise();
    } catch (err) {
      console.log(err);
      result.message = err.message;
      throw result;
    }
    if (debug) console.log(response.Body.toString());

    // iterate through table and find desired parish record
    // return location for desired parish
    var early_voting_table = JSON.parse(response.Body.toString());
    for (i in early_voting_table){
      //  console.log("Body["+i+"]: ",response.Body.toString());
      if ( early_voting_table[i].parish.includes(parish_UC) ) {
          if (parish_UC=="JEFFERSON" && early_voting_table[i].parish.includes("JEFFERSON DAVIS")) {
              // skip this one
          } else {
              if (debug) console.log("Found it! ",early_voting_table[i].location);
              result.location = result.location + early_voting_table[i].location;
          }
    }
  }

  return result;
}

/* The early_voting_lookup sub-function invokes the Cloudant API.
    @params.parish is required and is the parish name to be looked up in the Cloudant la_registrar_lookup database.
    @params.debug is not required. If provided, it's value controls the log output from the webhook.
*/
async function early_voting_lookup (params){
    console.log("entering early_voting_lookup function");

    var cloudant_url = "https://5117d004-a701-4751-bea9-5a91cf6b6e3b-bluemix.cloudantnosqldb.appdomain.cloud";

    var cloudant = await Cloudant({ url: cloudant_url, plugins: { iamauth: { iamApiKey: 'lmhMyPWxcrgPlrjuPzoVq54PCI0djJTzqIhd9P6rmh7n' } } });

    var db = await cloudant.db.use("la-early-voting-lookup");

    var parish = params.parish.toUpperCase();

    var q = {
        "selector": {
            "parish": {
                "$regex": parish
            }
        },
        "fields": [
         "parish",
         "location"
      ],
      "sort": [
         {
            "parish": "asc"
         }
      ]
    };

    if (debug) console.log("before query");

    var answer = "";
    var result;
    try {
        //result = await executeQuery(db, q);
        result = await db.find(q);
    }
    catch (err){
        console.log("Error: ",err);
    }
    for (i in result.docs){
        if (debug) console.log("doc"+i+" :",result.docs[i]);
        if (i == 0) {
            answer = answer + "<b>Early Voting Locations for\n" + result.docs[i].parish + " Parish:</b>\n";
        }
        answer = answer + result.docs[i].location + "\n";
    }
    if (debug) console.log(answer);

    var response = {answer:answer};

    return response;
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



/* The format_date sub-function extracts the time in AM/PM format from a Date object
*/
function format_date(utctime){
    var date = new Date(utctime * 1000);
    var time = date.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true, timeZone: 'America/Chicago' });
    return time;
}
