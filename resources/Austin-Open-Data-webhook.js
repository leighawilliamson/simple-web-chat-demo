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
function main(params) {
    var command = params.command;

    if (command === "get_inspection"){
//        console.log('Command recognized: ' + command );
        return get_inspection(params);
    } /*
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
    } */
    else {
	    return { message: 'Command not recognized: ' + command };
    }
}


/* The rest_inspect sub-function invokes the Austin Open Data API.
    @params.token is required for authorization to use the Austin Open Data API
    @params.name is required in order to identify the restuarant for which inspection results are requested.
*/
async function get_inspection (params){
    // easy debug printout
    // console.log("entering get_inspection function");

    var myHeaders = new Headers();
    myHeaders.append("X-App-Token", "4tM6Fm68gW3XjfwNcIhW6nAj9");

    var requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow'
    };

    // create return object with fields for status and also error return info
    var returnobj = {
        "status": "",
        "statusText": "",
        "errorCode": "",
        "errorMessage": "",
        "body": "",
        "message": ""
    };

    var url = "https://data.austintexas.gov/resource/ecmv-9xxi.json?$where=restaurant_name like \'\%25" + params.restaurant + "\%25\'";
//    console.log("url: " + url);

    // make the API call
    let response = await fetch(url, requestOptions);

    // set the return status values - note that fetch basically NEVER fails, so you have to check the status value
    returnobj.status = response.status;
    returnobj.statusText = response.statusText;

    // if an error occurred, capture the error info and return
    if ( !response.ok ) {
        let errorDetail = await response.json();
//console.log("error info: " + JSON.stringify(errorDetail.error));
        returnobj.errorCode = errorDetail.code;
        returnobj.errorMessage = errorDetail.message;
        return returnobj;
    }
    // otherwise, get the body of the response and crawl through it to get the requested info
    let body = await response.json();

    // first, check that something actually was returned, otherwise no restaurant matched the passed in name
    if (! body[0]){
//        console.log("no body returned!");
        returnobj.errorMessage = "No restaurant by that name found.";
        returnobj.errorCode = "46";
        return returnobj;
    }

    // an set of inspection records where returned for the named restaurant.
    // crawl through the inspections in order to locate the most recent one and use that.
    var date;
    var most_recent = new Date(0);
    var use_this;
    for (i in body){
        var inspection_date = body[i].inspection_date;
        date = new Date(Date.parse(inspection_date));
//        console.log("inspection date: " + date.toString());
        if (date > most_recent){
//            console.log("more recent inspection date found.");
            use_this = i;
            most_recent = date;
        }
    }
    var formatted_date = most_recent.toDateString();
//    console.log("most recent inspection was on = " + formatted_date);

    // get the address of the inspected restaurant
    var humanaddress = body[use_this].address.human_address;
    var fulladdress = JSON.parse(humanaddress);
    var street = fulladdress.address;
    var city = fulladdress.city;
//    console.log("address: " + humanaddress);
//    console.log("street: " + street);

    // build return message
    var return_msg = "The most recent inspection for " + params.restaurant;
    return_msg = return_msg + " located at " + street + " in " + city;
    return_msg = return_msg + " was on " + formatted_date + " and the score for the restaurent was ";
    return_msg = return_msg + body[use_this].score + " out of a possible 100.";
    returnobj.message = return_msg;

return returnobj;
}
