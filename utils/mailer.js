const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: process.env.MAIL_PORT == 465, // true for 465, false for other ports
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

/**
 * Send an email using the configured transporter
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text body
 * @param {string} [options.html] - HTML body (optional)
 * @returns {Promise<Object>} - Result from Nodemailer
 */
async function sendMail({ to, subject, text, html, attachments }) {
  try {
    const info = await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to,
      subject,
      text,
      html,
      attachments,
    });
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

module.exports = { sendMail };
