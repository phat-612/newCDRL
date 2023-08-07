const nodemailer = require('nodemailer');
const fs = require('fs');
const ejs = require('ejs');

function sendEmail(password, email) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'nguytuan04@gmail.com',
      pass: 'unjwfrdskgezbmym'
    },
  });
  // const emailTXT = fs.readFileSync(path.join('.certificate', 'localhost.key'), 'utf8');
  // const emailHTML = fs.readFileSync(path.join('.certificate', 'localhost.key'), 'utf8');
  const mailOptions = {
    from: '"Quản lý điểm rèn luyện" <nguytuan04@gmail.com>',
    to: `${email}`,
    subject: 'Yêu cầu đặt lại mật khẩu',
    text: ``,
    html: `<table width="100%" border="0" cellpadding="0" cellspacing="0">
  
        <td align="center">
          <table class="form" width="500" cellpadding="0" cellspacing="0" style="background-color: #e7ecf0; border-radius: 0.8rem; ">
            <tr style="height: 15;">
            <td></td>
            <td style="padding-top: 20px;text-align: center;"><div></div></td>
            <td></td>
          </tr>
            <tr>
              <td style="width: 5%;"></td>
              <td class="form-small" style="background-color: white; border-radius: 0.8rem;padding: 30px;">
                <img src="cid:fs1120020a17090af28b00b00263fc1ef1aasm843048pjb10" alt="logo trường Đại học CTUT">
    
                <p class="content" style="font-size: 14px; color: #121212;">
                  Chào bạn,
                  <br><br>
                  Chúng tôi nhận được yêu cầu xác nhận tài khoản từ bạn. Để hoàn tất quá trình xác thực, vui lòng sao chép mã xác nhận dưới đây.
                  <br><br>
                  Mã xác nhận của bạn: <br><strong style="color: #ff4c4c";font-size: "30px";padding:>${password}</strong>
                  <br><br>
                  Nếu bạn không thấy yêu cầu này, vui lòng bỏ qua email này. Tuyệt đối không chia sẻ mã xác nhận này với bất kỳ ai, bởi nó là yếu tố quan trọng để bảo vệ tài khoản của bạn.
                  <br><br>
                  Nếu bạn gặp bất kỳ khó khăn hoặc cần sự hỗ trợ, hãy liên hệ với chúng tôi qua địa chỉ hoặc số điện thoại liệt kê dưới đây.
                </p>
                
              </td>
              <td style="width: 5%;" ></td>
            </tr>
    
            <tr>
              <td></td>
              <td class="footer" style="font-size: 14px; text-align: center; padding: 20px 0;">
                <strong style="font-size: 15px; ">Trường Đại học Kỹ Thuật - Công nghệ Cần Thơ</strong> <br><br>
                Address: 256 Đ. Nguyễn Văn Cừ, An Hoà, Ninh Kiều, Cần Thơ 900000 <br>
                Phone: 0292 3898 167
              </td>
              <td></td>  
            </tr>
    
          </table>
        </td>
      
    </table>`,
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

sendEmail('xaedaw3', 'chandoralong@gmail.com')