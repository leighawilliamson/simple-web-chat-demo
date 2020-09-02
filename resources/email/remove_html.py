import re
# text = "<a>hello world</a>"

text1 = "['VIA Metropolitan Transit will make additional modifications to its essential service routes and schedules beginning Monday, April 27, 2020, in response to reduced ridership demands and available staffing. For questions, more information about the bus schedules, or to download a pocket schedule, please visit the <a href=\"VIAinfo.net/routes\"> VIA Routes Webpage</a> or call the goLine (210)362-2020. ', '', 'What else may I help you with?']"

TAG_RE = re.compile(r'<[^>]+>')


def remove_tags(text):
    return TAG_RE.sub('', text)


# def remove_tags(text):
#    ''.join(xml.etree.ElementTree.fromstring(text).itertext())


clean_string = remove_tags(text1)


print(clean_string)
