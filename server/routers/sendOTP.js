const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
    user: 'dilipatportfolio@gmail.com', 
    pass: 'qonxbjlxmzbnkkhc',
  },
});

const sendOTP = (userName,userEmail,otp)  => {
 
  let mailOptions = {
    from: 'dilipatportfolio@gmail.com',
    to: userEmail,
    subject: 'Email Verification',
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OTP Verification</title>
  <style>
      body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
      }
      .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          overflow: hidden;
      }
      .header {
          background-color: #007bff;
          color: #ffffff;
          padding: 20px;
          text-align: center;
      }
      .header h1 {
          margin: 0;
          font-size: 24px;
      }
      .content {
          padding: 20px;
          text-align: center;
      }
      .content p {
          font-size: 18px;
          color: #333333;
          line-height: 1.6;
      }
      .otp {
          font-size: 32px;
          font-weight: bold;
          color: #007bff;
          letter-spacing: 4px;
          background-color: #f9f9f9;
          padding: 10px 20px;
          border-radius: 5px;
          display: inline-block;
          margin: 20px 0;
      }
      .footer {
          background-color: #f4f4f4;
          padding: 20px;
          text-align: center;
          font-size: 14px;
          color: #777777;
      }
  </style>
</head>
<body>
  <div class="container">
      <div class="header">
          <h1>Verify Your Account</h1>
      </div>
      <div class="content">
          <p>Hello,${userName}</p>
          <p>Thank you for registering with us! Please use the following One-Time Password (OTP) to verify your account:</p>
          <div class="otp">${otp}</div>
          <p>This OTP is valid for only 10 minutes. Please do not share it with anyone.</p>
      </div>
      <div class="footer">
          <p>If you didn't request this, please ignore this email or contact support.</p>
          <p>&copy; 2024 Your Company. All rights reserved.</p>
      </div>
  </div>
</body>
</html>
`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return { message: 'Error sending email', error };
    } else {
      return { message: 'Email sent', info };
    }
  });
}


module.exports = {sendOTP};
