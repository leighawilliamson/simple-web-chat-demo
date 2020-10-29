import pdfkit

pdfkit.from_url('https://voterportal.sos.la.gov/earlyvoting', 'early_voting_locations.pdf')
