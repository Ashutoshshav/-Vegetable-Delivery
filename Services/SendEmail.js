const nodemailer = require("nodemailer");
require('dotenv').config();

// Create a Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'gmail', // or your preferred email service
    auth: {
        user: process.env.INVOICE_EMAIL, // your email address
        pass: process.env.INVOICE_PASS,    // your email password or app password
    },
});

async function handleSendEmail(emailAddress, subject, msg) {
    // Email options
    const mailOptions = {
        from: process.env.INVOICE_EMAIL, // sender address
        to: emailAddress, // recipient address
        subject: subject, // subject line
        text: msg, // plain text body
        // attachments: [
        //     {
        //         filename: "invoice.pdf",
        //         content: pdfBuffer,
        //         contentType: "application/pdf",
        //     },
        // ],
    };

    // Send email
    let info = await transporter.sendMail(mailOptions);

    return info;
}

module.exports = {
    handleSendEmail,
}