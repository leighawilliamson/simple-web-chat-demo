#!/bin/bash
# author: Leigh Williamson, leighw@us.ibm.com

# set default values to be used if no alternative is passed in on the command line
dbname=""
userstring=""
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

# run the following command to get the Bearer token "$TOK"
#curl -k -X POST   --header "Content-Type: application/x-www-form-urlencoded"   --header "Accept: application/json"   --data-urlencode "grant_type=urn:ibm:params:oauth:grant-type:apikey"   --data-urlencode "apikey=lmhMyPWxcrgPlrjuPzoVq54PCI0djJTzqIhd9P6rmh7n"   "https://iam.cloud.ibm.com/identity/token"



# echo "usage: bulk_load.sh -d database_name -u userstring [-h ] [-f <input json file>] [-l <log file>] [-a <apiKey file>] [-o <organization>]"
if [[ $help = "true" ]]
then
	echo "usage: bulk_load.sh -d database_name -u userstring [-h ] [-f <input json file>] [-l <log file>]"
    echo "NOTE: The environment variable TOK must be set to the Bearer token for the cloudant database."
	exit
fi

# ensure that required arguments have been supplied or set them by default
if [[ $dbname = "" ]]
then
  echo "dbname set to la-early-voting-lookup"
  dbname="la-early-voting-lookup"
#    echo "Database name must be set using the -d required argument!"
#    exit
fi
if [[ $userstring = "" ]]
then
  echo "set userstring to 5117d004-a701-4751-bea9-5a91cf6b6e3b-bluemix"
  userstring="5117d004-a701-4751-bea9-5a91cf6b6e3b-bluemix"
#    echo "User string must be set using the -u required argument!"
#    exit
fi

if [[ $inputfile = "" ]]
then
  echo "inputfile set to early_voting_locations.json"
  inputfile="early_voting_locations.json"
#    inputfile=$dbname.json
fi

#curl -X POST -H 'Content-type: application/json' -H'Authorization: '"$TOK"''  -d@$inputfile "https://c0c5e111-9787-4461-9e4e-95a207edb882-bluemix.cloudantnosqldb.appdomain.cloud/$dbname/_bulk_docs"
curl -X POST -H 'Content-type: application/json' -H'Authorization: '"$TOK"''  -d@./early_voting_locations.json "https://5117d004-a701-4751-bea9-5a91cf6b6e3b-bluemix.cloudantnosqldb.appdomain.cloud/la-early-voting-lookup/_bulk_docs"
