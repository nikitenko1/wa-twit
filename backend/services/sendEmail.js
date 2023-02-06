const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (to, subject, content) => {
  // The error exists as the email address in the "from" field in the message(in your nodejs code,,
  // to be sent using sendgrid) is not verified by sendgrid.
  const options = {
    from: process.env.SENDGRID_VERIFY_SINGLE_SENDER, // Change to your verified sender
    to,
    subject: `JSC Kyiv Postal Service | Kyiv Team - ${subject}`,
    html: content,
  };
  try {
    await sgMail.send(options);
    console.log('Email sent');
  } catch (err) {
    console.log(err.message);
  }
};

module.exports = sendEmail;
