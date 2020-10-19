import requests
import json

from copy import deepcopy
from bs4 import BeautifulSoup

# Initialize parameters
parish_str = ""
location_array = []

element = {"parish": "",
           "location": []}

final_data = []
finished_collection = False

output_file = "data.json"

# Web scraping routines
url = 'https://voterportal.sos.la.gov/earlyvoting'
result = requests.get(url)
soup = BeautifulSoup(result.text, "lxml")

# Looking for <td> tags for voting location table
for link in soup.find_all('td'):

    # Looking for <strong> tag for Parish.
    if (link.strong != None):

        # String manipulation for Parish
        parish_str = link.text.strip()

    # Looking for <div> tag for Location.
    if (link.div != None):

        # More than one location.  Loop through to capture all of them.
        for child in link.children:

            # String Manipulation for Location
            str1 = str(child)

            # Remove <div> tags
            str1 = str1.replace("<div>", "")
            str1 = str1.replace("</div>", "")

            # Remove unnecessary whitespace
            str1 = str1.lstrip()
            str1 = str1.rstrip()
            str1 = str1.strip()
            str1 = ' '.join(str1.split())

            # Sub line break tag with space character
            str1 = str1.replace("<br/>", " ")

            # Skip blank fields, appending location txt into array
            if str1 != "":
                location_str = str1
                location_array.append(location_str)
                finished_collection = True

    # Captured all parish and location data
    if (finished_collection):

        element["parish"] = parish_str
        element["location"] = location_array

        final_data.append(deepcopy(element))

        parish_str = ""
        location_array = []

        finished_collection = False

#print (final_data)

# Write to JSON
with open(output_file, 'w') as outfile:
    json.dump(final_data, outfile)
