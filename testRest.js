const fetch = require('node-fetch');
global.Headers = fetch.Headers;

async function main(params) {
console.log("enter engage function");
var myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");
myHeaders.append("Authorization", params.auth_token);

// set time of request in UTC, formatted according to ISO 8601.
    var date = new Date(Date.now());
    var dateString = date.toISOString();
    console.log("date string: " + dateString)

var raw = JSON.stringify({"messages":[{"inbound":true,
"text":"Please contact me",
"date": dateString }],
"user":{
    "firstName": params.user_firstname,
    "lastName": params.user_lastname,
    "email": params.email,
    "phone": params.email},
"language":"en"});

var requestOptions = {
  method: 'POST',
  headers: myHeaders,
  body: raw,
  redirect: 'follow'
};

var returnobj = {
    "status": "",
    "statusText": "",
    "errorCode": "",
    "errorMessage": ""
}

let response = await fetch("https://engage.spsdgtl.com/webhooks/nativechat", requestOptions);

returnobj.status = response.status;
returnobj.statusText = response.statusText;

if ( !response.ok ) {
    let errorDetail = await response.json();
    console.log(errorDetail.errors[0].code);
    returnobj.errorCode = errorDetail.errors[0].code;
    returnobj.errorMessage = errorDetail.errors[0].message;

}

return returnobj;
}
