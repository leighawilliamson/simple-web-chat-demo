/**
  *
  * main() will be run when you invoke this action
  *
  * @params Cloud Functions actions accept a single parameter, which must be a JSON object.
  * @params.command = command passed in telling this webhook which API to invoke
  *
  * @return The output of this action, which must be a JSON object.
  *
  */
const needle = require('needle');
const fetch = require('node-fetch');
global.Headers = fetch.Headers;

/* The main function just serves to determine which command has been requested by the calling code.
    Based on the value of params.command passed in, a sub-function is invoked by main().
*/
module.exports = function (params) {
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
    else {
	    return { message: 'Command not recognized: ' + command };
    }
}

/* The predictions sub-function invokes the Swiftly API.
    @params.swiftly_APIKey is required for authorization to use the Swiftly API
    @params.stopcode is required in order to identify the stop for which predictions are requested.
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
    console.log("testkey result: " + JSON.stringify(body));
    return { body: response.body };

}

/* The engage sub-function invokes the SPS Digital Engage webhook API (https://engage.spsdgtl.com/docs/webhooks#post-webhooks-nativechat).
    This API registers a user to have someone from VIA's support team contact them later.
    @params.auth_token is required for authorization to use the SPS Digital API
    @params.user_firstname is a required string containing the user's first name
    @params.user_lastname is a required string containing the user's last name
    @params.email is an optional string containing the user's email address
    @params.phone is an optional string containing the user's phone number in E.164 format (https://www.twilio.com/docs/glossary/what-e164)

    Either the email or the phone must be supplied or the call will fail. But both are not required, as long as one is supplied.
*/
async function engage(params) {
    console.log("enter engage function");

    // set up http request headers
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", params.auth_token);

    // set time of request in UTC, formatted according to ISO 8601.
    var date = new Date(Date.now());
    var dateString = date.toISOString();
    console.log("date string: " + dateString)

    // create request body using input parameters
    var raw = JSON.stringify({"messages":[{"inbound":true,
                                            "text":"Please contact me",
                                            "date": dateString
                                        }],
                                "user":{
                                    "firstName": params.user_firstname,
                                    "lastName": params.user_lastname,
                                    "email": params.email,
                                    "phone": params.phone
                                    },
                                "language":"en"
                            });

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };

    // create return object with fields for status and also error return info
    var returnobj = {
        "status": "",
        "statusText": "",
        "errorCode": "",
        "errorMessage": ""
    };

    // make the API call
    let response = await fetch("https://engage.spsdgtl.com/webhooks/nativechat", requestOptions);

    // set the return status values - note that fetch basically NEVER fails, so you have to check the status value
    returnobj.status = response.status;
    returnobj.statusText = response.statusText;

    if ( !response.ok ) {
        let errorDetail = await response.json();
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
