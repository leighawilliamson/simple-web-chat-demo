import smtplib
import ssl
smtp_server = "smtp.gmail.com"
sender_email = "testmail4leigh@gmail.com"  # Enter your address
receiver_email = "testmail4leigh+tester1@gmail.com"  # Enter receiver address
port = 465  # For SSL
password = input("Type your password and press enter: ")
message = """\
Subject: Hi there

This message is sent from Python."""

# Create a secure SSL context
context = ssl.create_default_context()

with smtplib.SMTP_SSL("smtp.gmail.com", port, context=context) as server:
    server.login("testmail4leigh@gmail.com", password)
    # TODO: Send email here
    server.sendmail(sender_email, receiver_email, message)
