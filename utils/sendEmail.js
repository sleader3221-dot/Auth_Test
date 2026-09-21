const nodemailer = require("nodemailer");

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const emailUser = process.env.EMAIL_USER || "ymani.dukaanse@gmail.com";
    const emailPass = process.env.EMAIL_PASS || "iytn huvi wqnb nqgl";

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    const info = await transporter.sendMail({
      from: `"DukaanSE" <${emailUser}>`,
      to,
      subject,
      text,
      html,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Nodemailer error:", error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { sendEmail };
