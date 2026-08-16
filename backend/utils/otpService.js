/**
 * @file otpService.js
 * @description Service module for generating and dispatching OTP verification emails.
 */

import sendEmail from "./emailService.js";

/**
 * Sends a One-Time Password (OTP) verification email to the user.
 * @async
 * @function sendOtpEmail
 * @param {string} email - Recipient email address.
 * @param {string} otp - The generated OTP code.
 * @returns {Promise<void>}
 */
export const sendOtpEmail = async (email, otp) => {
    const subject = "CSC NITJ Account Verification OTP";
    const html = `
        <div style="background-color: #010614; padding: 30px; font-family: sans-serif; color: #ffffff; border-radius: 12px; border: 1px solid rgba(0,209,255,0.2);">
            <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="color: #ffffff; text-transform: uppercase; margin: 0;">CSC <span style="color: #00D1FF;">NITJ</span></h2>
                <p style="color: #00D1FF; font-size: 10px; font-family: monospace; letter-spacing: 2px; margin-top: 5px;">SECURE GATEWAY VERIFICATION</p>
            </div>
            
            <p style="color: #9ca3af; font-size: 14px; line-height: 1.5;">
                You have initiated a registration request for the Cyber Security Club NITJ portal. Use the verification code below to complete your authorization:
            </p>

            <div style="background-color: rgba(0,209,255,0.05); border: 1px dashed rgba(0,209,255,0.4); padding: 20px; text-align: center; border-radius: 8px; margin: 24px 0;">
                <span style="font-size: 32px; font-family: monospace; font-weight: bold; letter-spacing: 8px; color: #00D1FF;">${otp}</span>
            </div>

            <p style="color: #6b7280; font-size: 12px; text-align: center;">
                This code is valid for <strong>1 hour</strong>. Do not share this code with anyone.
            </p>

            <div style="border-top: 1px solid rgba(255,255,255,0.1); margin-top: 24px; padding-top: 16px; text-align: center;">
                <p style="color: #4b5563; font-size: 10px; font-family: monospace; text-transform: uppercase; letter-spacing: 1px;">
                    // SECURING_THE_FUTURE_OF_CYBERSPACE
                </p>
            </div>
        </div>
    `;
    
    await sendEmail(email, subject, html);
};