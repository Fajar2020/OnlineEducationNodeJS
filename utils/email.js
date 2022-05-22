import nodemailer from "nodemailer";


export const sendEmailToUser = (emailTo, subject, bodyText) => {
    // using nodemailer approach with outlook email
    const transporter = nodemailer.createTransport({
        host: "smtp-mail.outlook.com", // hostname
        secureConnection: false, // TLS requires secureConnection to be false
        port: 587, // port for secure SMTP
        tls: {
            ciphers:'SSLv3'
        },
        auth: {
            user: process.env.EMAIL_FROM,
            pass: process.env.EMAIL_PASS_FROM
        }
    });

    return transporter.sendMail({
        from: process.env.EMAIL_FROM, // sender address
        to: emailTo, // list of receivers
        subject, // Subject line
        html: bodyText, // html body
    });
};



// incase using aws

/*
import AWS from "aws-sdk";

const awsConfig = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
    apiVersion: process.env.AWS_API_VERSION
}

const SES = new AWS.SES(awsConfig);

export const sendEmailToUser = async (req, res) => {
    console.log('comehere')
    const params = {
        Source: process.env.EMAIL_FROM,
        Destination: {
            ToAddresses: ['fajarkusumaningayu@gmail.com ']
        },
        ReplyToAddresses: [process.env.EMAIL_FROM],
        Message: {
            Body: {
                Html: {
                    Charset: 'UTF-8',
                    Data: `
                        <html>
                            <h1>Reset password link</h1>
                            <p>Please use the following</p>
                        </html>
                    `
                }
            },
            Subject: {
                Charset: 'UTF-8',
                Data: 'Password reset link'
            }
        }
    };

    const emailSent = SES.sendEmail(params).promise();

    emailSent.then( (data) => {
        console.log(data)
        res.json({ok: true})
    }).catch ( (err) => {
        console.log(err);
    })

};
*/
