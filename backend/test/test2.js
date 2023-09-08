const nodemailer = require('nodemailer');
const fs = require('fs');
const ejs = require('ejs');
const path = require("path");

function sendEmail(password, email) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'nguytuan04@gmail.com',
      pass: 'unjwfrdskgezbmym'
    },
  });
  const emailTXT = fs.readFileSync(path.join('src', 'emailTemplate', 'email.txt'), 'utf8');
  const emailHTML = fs.readFileSync(path.join('src', 'emailTemplate', 'email.ejs'), 'utf8');

  const mailOptions = {
    from: '"Quản lý điểm rèn luyện" <nguytuan04@gmail.com>',
    to: `${email}`,
    subject: 'Yêu cầu đặt lại mật khẩu',
    text: emailTXT.replace('${password}', password),
    html: ejs.render(emailHTML, { password: password }),
    attachments: [{
      filename: 'image.png',
      path: './src/img/sv_logo_dashboard.png',
      cid: 'fs1120020a17090af28b00b00263fc1ef1aasm843048pjb10' //same cid value as in the html img src
    }]
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log('SYSTEM | SEND_EMAIL | ', error);
    } else {
      console.log(`SYSTEM | SEND_EMAIL | ${info.response}`);
      // do something useful
    }
  });
}

sendEmail('xaedaw3', 'hungthinhh2003@gmail.com');
sendEmail('xaedaw3', 'chandoralong@gmail.com');