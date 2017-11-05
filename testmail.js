require('dotenv').config();
// console.log(process.env.PRIVATEEMAIL_USER);
// console.log(process.env.PRIVATEEMAIL_PASS);

var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
  host: 'mail.privateemail.com',
  port: 587,
  auth: {
    user: process.env.PRIVATEEMAIL_USER,
    pass: process.env.PRIVATEEMAIL_PASS, 
  }
});

var mailOptions = {
  from: process.env.PRIVATEEMAIL_USER,
  to: 'michael.dean.haynie@gmail.com',
  subject: 'This is the subject of a test email (587)',
  text: 'Hi!',
};

transporter.sendMail(mailOptions, function(err, info){
  if(err){
    console.log('Damn. Something went wrong.');
    console.log(err);
  }else{
    console.log('Message sent: ' + info.response);
  }
});