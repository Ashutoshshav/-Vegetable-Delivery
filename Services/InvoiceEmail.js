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
