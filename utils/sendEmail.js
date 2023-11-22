const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  // host: process.env.SMTP_HOST,
  // port: process.env.PORT,
  service: process.env.SMTP_HOST,
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

// async..await is not allowed in global scope, must use a wrapper
const sendEmail = async (options) => {
  // send mail with defined transport object
  const message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`, // sender address
    to: options.email,
    subject: options.subject, // Subject line
    text: options.message,// plain text body
  };

  const info = await transporter.sendMail(message);

  console.log("mail: ", info);
};

module.exports = sendEmail;