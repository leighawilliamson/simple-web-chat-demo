#!/bin/bash
# author: Leigh Williamson, leighw@us.ibm.com

# set default values to be used if no alternative is passed in on the command line
dbname=""
#org="myOrg"
userstring=""
#apiKeyFile="myApiKey.json"
log_file="bulk_load.log"
inputfile=""
help=""
# parse any arguments passed in on the command line
while getopts hd:l:a:o:s:f: option
do
 case "${option}"
 in
 h) help="true";;
 d) dbname=${OPTARG};;
 l) log_file=${OPTARG};;
 a) apiKeyFile=${OPTARG};;
 o) org=${OPTARG};;
 u) userstring=${OPTARG};;
 f) inputfile=$OPTARG;;
 esac
done

# echo "usage: bulk_load.sh -d database_name -u userstring [-h ] [-f <input json file>] [-l <log file>] [-a <apiKey file>] [-o <organization>]"
if [[ $help = "true" ]]
then
	echo "usage: bulk_load.sh -d database_name -u userstring [-h ] [-f <input json file>] [-l <log file>]"
    echo "NOTE: The environment variable TOK must be set to the Bearer token for the cloudant database."
	exit
fi

# ensure that required arguments have been supplied
if [[ $dbname = "" ]]
then
    echo "Database name must be set using the -d required argument!"
    exit
fi
if [[ $userstring = "" ]]
then
    echo "User string must be set using the -u required argument!"
    exit
fi

if [[ $inputfile = "" ]]
then
    inputfile=$dbname.json
fi

#curl -X POST -H 'Content-type: application/json' -H'Authorization: '"$TOK"''  -d@$inputfile "https://c0c5e111-9787-4461-9e4e-95a207edb882-bluemix.cloudantnosqldb.appdomain.cloud/$dbname/_bulk_docs"
curl -X POST -H 'Content-type: application/json' -H'Authorization: '"$TOK"''  -d@$inputfile "https://$userstring.cloudantnosqldb.appdomain.cloud/$dbname/_bulk_docs"
