#!/bin/bash
# author: Leigh Williamson, leighw@us.ibm.com
# requires the Bluemix CLI which can be downloaded from http://clis.ng.bluemix.net/ui/home.html
# requires use of an APIKey to login to Bluemix: https://console.bluemix.net/iam/?env_id=ibm:yp:us-south#/apikeys

# set default values to be used if no alternative is passed in on the command line
endpoint="https://api.ng.bluemix.net"
org="myOrg"
loginspace="dev"
apiKeyFile="myApiKey.json"
log_file="bmxadmin.log"
inputfile="example.csv"
help=""

# parse any arguments passed in on the command line
while getopts he:l:a:o:s:f: option
do
 case "${option}"
 in
 h) help="true";;
 e) endpoint=${OPTARG};;
 l) log_file=${OPTARG};;
 a) apiKeyFile=${OPTARG};;
 o) org=${OPTARG};;
 s) loginspace=${OPTARG};;
 f) inputfile=$OPTARG;;
 esac
done

if [[ $help = "true" ]]
then
	echo "usage: bmxadmin.sh [-h ] [-f <input csv file>] [-e <endpoint>] [-l <log file>] [-a <apiKey file>] [-o <organization>] [-s <login space>]"
	exit
fi

# initialize & clear the log file
echo " " > $log_file
echo "Starting script" 2>&1 | tee -a $log_file
echo " " 2>&1 | tee -a $log_file

# log the environment used for this execution of the script
echo "Values used in this run of the script:" 2>&1 | tee -a $log_file
echo "Endpoint: $endpoint" 2>&1 | tee -a $log_file
echo "Log file: $log_file" 2>&1 | tee -a $log_file
echo "ApiKey file: $apiKeyFile" 2>&1 | tee -a $log_file
echo "Space used to login: $loginspace" 2>&1 | tee -a $log_file
echo "Organization: $org" 2>&1 | tee -a $log_file
echo "Input csv file: $inputfile" 2>&1 | tee -a $log_file
echo " " 2>&1 | tee -a $log_file

echo "Setting CLI endpoint..." $endpoint
bx api $endpoint  >> $log_file
echo "  "  2>&1 | tee -a $log_file

echo "Logging in using: " $apiKeyFile 2>&1 | tee -a $log_file
bx login --apikey @$apiKeyFile -s $loginspace  >> $log_file
echo "  "  2>&1 | tee -a $log_file

echo "List existing users for organization: " $org >> $log_file
bx iam org-users $org >> $log_file
echo "  "  >> $log_file

echo "Reading input file " $inputfile "..." 2>&1 | tee -a $log_file
echo "  "  2>&1 | tee -a $log_file
IFS=","
while read name space role
do
		if [ "$name" != "username" ] # skip the csv file header line
		then
		 	echo "Processing username: $name; space: $space; role: " ${role%?} 2>&1 | tee -a $log_file
			echo "executing: bx iam org-user-add $name $org" >> $log_file
			bx iam org-user-add $name $org  >> $log_file

			echo "executing: bx iam space-role-set $name $org $space " ${role%?} >> $log_file
			bx iam space-role-set $name $org $space ${role%?} >> $log_file
		else
			echo " " >> $log_file
			echo "Skipping cvs file header line" >> $log_file
			echo " " >> $log_file
		fi
done < $inputfile

echo "  "  2>&1 | tee -a $log_file
echo "Resulting list of users for organization: " $org >> $log_file
bx iam org-users $org >> $log_file
echo " " >> $log_file
echo "Script complete!" 2>&1 | tee -a $log_file
echo "Look in $log_file file for details of script execution."
