const nodemailer = require("nodemailer");
const path = require("path");

//set mail password
let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_ACC,
    pass: process.env.GOOGLE_PASS_CODE,
  },
});

let mail = {};

mail.sendMail = function (
  to,
  subject,
  body,
  isHTML = 1,
  attachments = [],
  cc = "",
  bcc = ""
) {
  return new Promise(function (fulfill, reject) {
    const logoPath = path.join(__dirname, "../public/logo.png");
    var mailOptions = {
      from: "heet3998@gmail.com",
      to: to,
      subject: subject,
      text: isHTML ? "" : body,
      html: isHTML ? body : "",
      attachments: [
        ...attachments,
        {
          filename: "logo.png",
          path: logoPath,
          cid: "logo",
        },
      ],
    };

    if (cc) mailOptions["cc"] = cc;

    if (bcc) mailOptions["bcc"] = bcc;

    if (attachments && attachments.length > 0) {
      mailOptions["attachments"] = attachments;
    }

    // send mail with defined transport object
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        fulfill(0);
        return console.log(error);
      }
      fulfill(1);
    });
  });
};

module.exports = mail;
