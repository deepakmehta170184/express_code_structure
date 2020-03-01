import nodemailer from 'nodemailer';

const mail = async (subject, to, message) => {
    let transport = await nodemailer.createTransport({
        port: process.env.smtpPort,      //un-comment for live 
        host: process.env.smtpHost,      //un-comment for live 
        service:'gmail',
        auth: {
            user: process.env.smtpUser,
            pass: process.env.smtpPassword
        },
        // tls: {
        //     rejectUnauthorized: false       //for testing
        // }
    })

    var message = {
        from: process.env.smtpUser,
        to: to,
        subject: subject,
        // text: message    //text only message
        html: message       //html embedded message 
    }

    let response = await transport.sendMail(message);

    return response;
}
export default {
    sendMail: mail
}