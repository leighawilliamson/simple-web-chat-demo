import smtplib
import ssl
import email
import csv


from email import encoders
from email.mime.base import MIMEBase
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

subject = "VIA Virtual Assistant Report: Customer Care Exits"
body = "This email contains the most recent Customer Care Exits report attachment created by IBM Watson Studio."
smtp_server = "smtp.gmail.com"
sender_email = "testmail4leigh@gmail.com"  # Enter your address
receiver_email = "testmail4leigh+tester1@gmail.com"  # Enter receiver address
port = 465  # For SSL
# password = input("Type your password and press enter: ")
password = "BzmHcZm8U98b9amaiwqn"

# Create a multipart message and set headers
message = MIMEMultipart()
message["From"] = sender_email
# message["To"] = receiver_email
message["Subject"] = subject
# message["Bcc"] = receiver_email  # Recommended for mass emails

# Add body to email
message.attach(MIMEText(body, "plain"))

filename = "Escalated_sample.xlsx"  # In same directory as script

# Open PDF file in binary mode
with open(filename, "rb") as attachment:
    # Add file as application/octet-stream
    # Email client can usually download this automatically as attachment
    part = MIMEBase("application", "octet-stream")
    part.set_payload(attachment.read())

# Encode file in ASCII characters to send by email
encoders.encode_base64(part)

# Add header as key/value pair to attachment part
part.add_header(
    "Content-Disposition",
    f"attachment; filename= {filename}",
)

# Add attachment to message and convert message to string
message.attach(part)
text = message.as_string()

# Create a secure SSL context
context = ssl.create_default_context()

with smtplib.SMTP_SSL("smtp.gmail.com", port, context=context) as server:
    server.login("testmail4leigh@gmail.com", password)
    with open("contacts_file.csv") as file:
        reader = csv.reader(file)
        next(reader)  # Skip header row
        for name, email in reader:
            server.sendmail(sender_email, email, text)
