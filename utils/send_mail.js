const axios = require("axios");

async function sendOTPEmail(email, userData, isOtp) {
  const apiKey = process.env.SENDINBLUE_API_KEY;
  const senderEmail = process.env.SENDER_EMAIL;
  const senderName = process.env.SENDER_NAME;

  const url = "https://api.sendinblue.com/v3/smtp/email";

  const data = {
    sender: {
      name: senderName,
      email: senderEmail,
    },
    to: [{ email: email }],
    subject: "OTP Email",
    htmlContent: isOtp
      ? `
      <html>
        <body>
          <h1>Your OTP: ${userData.otp}</h1>
        </body>
      </html>
    `
      : userData,
  };

  try {
    const response = await axios.post(url, data, {
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
    });

    console.log("OTP email sent successfully");
    return true;

    // Handle response or perform any necessary actions after successful email sending
  } catch (error) {
    console.error("Error sending OTP email:", error);
    return false;
    // Handle error or perform any necessary actions if email sending fails
  }
}

module.exports = sendOTPEmail;
