const nodemailer = require('nodemailer')

let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    requireTLS: true,
    tls: {rejectUnauthorized: false},
    auth: {
        user: 'appemailnotifier@gmail.com',
        pass: 'appemailnotifier@123'
    }
});
// const transporter = nodemailer.createTransport({
//     host: 'smtp.ethereal.email',
//     port: 587,
//     auth: {
//         user: 'rocio.bogan66@ethereal.email',
//         pass: '8jm9mcrSdGm7J8gH6d'
//     }
// });

let welcomeMail = (data) => {
    let mailOptions = {
        from: 'Admin', // sender address
        to: data.email,
        subject: 'Welcome e-Mail - Meeting Scheduler', // Subject line
        html: `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f3f3f3;font-family:Arial,Helvetica,sans-serif">
        <tbody><tr>
          <td align="center">
            <table cellpadding="0" cellspacing="0" style="margin:25px auto;background:#ffffff;border-radius:3px;width:500px">
              <tbody><tr style="border:0">
                <td style="padding:20px;border-top-left-radius:3px;border-top-right-radius:3px;text-align:left;border:0;background-color:rgb(204,204,204)">
                  <a href="javascript:void(0);" style="border:none;text-decoration:none;font-size:22px">
                      Meeting Scheduler
                  </a>‌
                </td>
              </tr>
              <tr style="border:0">
                <td style="padding:20px;background:#fff;border:0">
                  <h3 style="font-size:18px">
                    Hi ${data.fullName}
                  </h3>
      
                  <p style="margin-bottom:30px">
                  This is a welcome message from Meeting Scheduler.
                  </p>
      
                  <p></p>
                  <p></p>
                </td>
              </tr>
              <tr style="border:0">
                <td style="padding:20px 40px 20px;text-align:center;border:0;background-color:rgb(204,204,204)">
                  ‌<a href="javascript:void(0);" >Login to your account </a>
                </td>
              </tr>
            </tbody></table>
          </td>
        </tr>
      </tbody></table>`, // html body
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    });

}

let passResetMail = (data) => {
    let mailOptions = {
        from: 'Admin', // sender address
        to: data.email,
        subject: 'Password Reset e-Mail - Meeting Scheduler', // Subject line
        // text: `http://localhost:4200/resetpassword/${data.token}`, // plain text body
        html:
        `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f3f3f3;font-family:Arial,Helvetica,sans-serif">
        <tbody><tr>
          <td align="center">
            <table cellpadding="0" cellspacing="0" style="margin:25px auto;background:#ffffff;border-radius:3px;width:500px">
              <tbody><tr style="border:0">
                <td style="padding:20px;border-top-left-radius:3px;border-top-right-radius:3px;text-align:left;border:0;background-color:rgb(204,204,204)">
                  <a href="javascript:void(0);" style="border:none;text-decoration:none;font-size:22px">
                      Meeting Scheduler
                  </a>‌
                </td>
              </tr>
              <tr style="border:0">
                <td style="padding:20px;background:#fff;border:0">
                  <h3 style="font-size:18px">
                    Hi ${data.fullName}
                  </h3>
      
                  <p style="margin-bottom:30px">
                  Please click the link to reset your password, <a href="http://localhost:4200/resetpassword/${data.token}"> <h4> Reset Password</h4></a>
                  </p>
      
                  <p></p>
                  <p></p>
                </td>
              </tr>
              <tr style="border:0">
                <td style="padding:20px 40px 20px;text-align:center;border:0;background-color:rgb(204,204,204)">
                  ‌<a href="http://localhost:4200/resetpassword/${data.token}" >Reset your Password </a>
                </td>
              </tr>
            </tbody></table>
          </td>
        </tr>
      </tbody></table>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    });
}

let newMeetMail = (data, mail) => {
    let mailOptions = {
        from: data.userName, // sender address
        to: mail,
        subject: "New Meeting e-Mail - Meeting Scheduler", // Subject line
        html: `<h4> Meeting Purpose: ${data.title} </h4>/n
        <h4>    Date: ${data.start}</h4>`, // html body
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
    });
}

let rescheduleMeetMail = (data, mail) => {
    let mailOptions = {
        from: data.userName, // sender address
        to: mail,
        subject: "Meeting Rescheduled e-Mail - Meeting Scheduler", // Subject line
        html: `/n
        <h4>Meeting Purpose: ${data.title}</h4>/n
        <h4>  New Date: ${data.start}</h4>`, // html body
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
    });
}

module.exports = {
    welcomeMail: welcomeMail,
    passResetMail: passResetMail,
    newMeetMail: newMeetMail,
    rescheduleMeetMail: rescheduleMeetMail
}
