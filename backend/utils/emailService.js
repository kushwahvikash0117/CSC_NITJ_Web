/**
 * @file emailService.js
 * @description Utility module for sending emails via Nodemailer and Gmail service integration.
 */

import nodemailer from "nodemailer";

/**
 * Sends an email using configured environment variables and Nodemailer.
 * @async
 * @function sendEmail
 * @param {string} to - Recipient email address.
 * @param {string} subject - Email subject line.
 * @param {string} body - HTML body content of the email.
 * @returns {Promise<import('nodemailer').SentMessageInfo>} The sent message info object.
 */
const sendEmail = async (to, subject, body) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        socketTimeout: 10000, 
        connectionTimeout: 10000,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD,
        },
        family: 4, 
    });

    try {
        const info = await transporter.sendMail({
            from: `"Cyber Security Club - NITJ" <${process.env.EMAIL}>`,
            to,
            subject,
            html: body,
        });

        console.log(`[Email Service] Email sent successfully: ${info.messageId}`);
        return info;
    } catch (error) {
console.error("[Email Service Error]", error);        throw error;
    }
};

export default sendEmail;