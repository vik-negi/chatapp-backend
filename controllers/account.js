const { User } = require("../schema/userSchema");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendOTPEmail = require("../utils/send_mail");
const { OTP } = require("../schema/otpSchema");
const generateUniqueUserName = require("../utils/username_generator");

const generateOTP = () => {
  const digits = "0123456789";
  let OTP = "";
  for (let i = 0; i < 4; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
};

class AccountController {
  static signup = async (req, res) => {
    const { password, name, mobile, email, deviceNotificationId } = req.body;
    var emailOrMobile = null;

    if (
      req.body["password"] &&
      req.body["name"] &&
      req.body["deviceNotificationId"] &&
      (req.body["email"] || req.body["mobile"])
    ) {
      if (req.body["email"]) {
        emailOrMobile = req.body["email"].toLowerCase();
        const emailExists = await User.findOne({ email: emailOrMobile });
        if (emailExists) {
          return res.json({
            status: "failed",
            message: "Email already exists",
          });
        }
      }
      if (req.body["mobile"]) {
        emailOrMobile = req.body["mobile"].toLowerCase();
        const mobileExists = await User.findOne({ mobile: emailOrMobile });
        if (mobileExists) {
          return res.status(400).json({
            status: "failed",
            message: "Mobile number already exists",
          });
        }
      }
      try {
        const username = generateUniqueUserName(name);
        const user = await User.findOne({ username: username });
        if (user) {
          return res.status(400).json({ message: "Username already exists" });
        }
        const id = new Date().toJSON();
        const existing = await User.findOne({
          id: id,
        });
        if (existing) {
          return res.status(400).json({
            status: "failed",
            message: "Id already exists Internal backend error",
          });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
          username: username,
          password: hashedPassword,
          name: name,
          deviceNotificationId: deviceNotificationId,
        });

        if (email) {
          newUser.email = email;
        }
        if (mobile) {
          newUser.mobile = mobile;
        }
        newUser.save((err, user) => {
          if (err) {
            return res.status(400).json({
              status: "failed",
              message: `Error occured While Creating account ${err}`,
            });
          } else {
            return res.status(200).json({
              status: "success",
              message: "User created successfully",
            });
          }
        });
      } catch (err) {
        return res.status(400).json({
          status: "failed",
          message: err.message,
        });
      }
    } else {
      return res.status(400).json({
        status: "failed",
        message: "All fields are required",
      });
    }
  };

  static signin = async (req, res) => {
    const { username, password, email } = req.body;
    var user;
    if ((username || email) && password) {
      try {
        if (username) {
          user = await User.findOne({ username: username }).select("+password");
        } else {
          user = await User.findOne({ email: email }).select("+password");
        }
        if (user) {
          const isvalidPassword = await bcrypt.compare(password, user.password);
          if (isvalidPassword) {
            const id = user._id;
            const token = jwt.sign({ _id: id }, process.env.JWT_SECRET_KEY, {
              expiresIn: "60d",
            });
            return res.status(200).json({
              status: "success",
              token: token,
              data: user,
              message: "User logged in successfully",
            });
          } else {
            return res.status(400).json({
              status: "failed",
              message: "Invalid Credientials",
            });
          }
        } else {
          return res.status(400).json({
            status: "failed",
            message: "User not found",
          });
        }
      } catch (err) {
        return res.status(400).json({
          status: "failed",
          message: err.message,
        });
      }
    } else {
      return res.status(400).json({
        status: "failed",
        message: "All fields are required",
      });
    }
  };

  static searchUser = async (req, res) => {
    const { username } = req.params;
    if (username) {
      try {
        const users = await User.find({
          $or: [
            { username: { $regex: username, $options: "i" } },
            { name: { $regex: username, $options: "i" } },
          ],
        }).select("-password");
        if (users) {
          res.status(200).json({
            status: "success",
            data: users,
          });
        }
      } catch (err) {
        return res.status(500).json({
          status: "failed",
          message: err,
        });
      }
    } else {
      return res.status(400).json({
        status: "failed",
        message: "Username required",
      });
    }
  };

  static forgetPassword = async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email: email });

    console.log("user", user);

    if (!user) {
      return res.status(400).json({
        status: "failed",
        message: "User not found",
      });
    }

    const otp = generateOTP();

    let mailData = `
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Forgot Password - ${user.name}</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
        color: #444;
      }
      h1 {
        color: #007bff;
      }
      h2 {
        color: #007bff;
      }
      h3 {
        color: #007bff;
      }
      p {
        margin-bottom: 10px;
      }
      .highlight {
        background-color: #ffe5b4;
        padding: 5px;
        font-weight: bold;
      }
    </style>
  </head>
  <body>
   <h1> Hello ${user.name} </h1>
    <h2> You have requested to reset your password </h2>
    <p> Please use the following OTP to reset your password </p>
    <h3 class="highlight"> ${otp} </h3>
    <p> If you did not request a password reset, please ignore this email or reply to let us know. This password reset is only valid for the next 24 hours. </p>
    <p> Thanks, </p>
    <p> The ChatApp Team </p>

  </body>
</html>
`;

    const isSent = await sendOTPEmail(email, mailData, false);
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "10m",
    });

    if (isSent) {
      console.log("otp", OTP);
      var otpData = await OTP.findOne({ email: email });
      console.log("otpData", otpData);

      if (otpData) {
        await OTP.findOneAndUpdate(
          { email: email },
          { otp: otp, verified: false },
          { new: true }
        );
      } else {
        await OTP.create({
          email,
          otp,
        });
      }
      return res.status(200).json({
        status: "success",
        token: token,
        message: "OTP sent successfully",
      });
    }
    return res.status(400).json({
      status: "failed",
      message: "Error sending OTP",
    });
  };

  static verifyOtp = async (req, res) => {
    const { otp } = req.body;
    if (!otp) {
      return res.status(400).send({
        status: "failed",
        message: "Required fields missing",
      });
    }
    try {
      const otpData = await OTP.findOne({ email: req.user.email });

      console.log("otpData", otpData);
      if (!otpData) {
        return res.status(404).send({
          status: "failed",
          message: "OTP not found",
        });
      }
      if (otpData.otp !== otp) {
        return res.status(404).send({
          status: "failed",
          message: "Invalid OTP",
        });
      }
      otpData.verified = true;
      otpData.save();
      return res.status(200).send({
        status: "success",
        message: "OTP verified successfully",
      });
    } catch (e) {
      console.log("catch error : ", e);
      return res.status(500).send({ status: "failed", message: e.message });
    }
  };

  static changePasswordOtp = async (req, res) => {
    const { newPassword } = req.body;
    if (!newPassword) {
      return res.status(400).send({
        status: "failed",
        message: "Required fields missing",
      });
    }
    const email = req.user.email;
    try {
      const otpData = await OTP.findOne({ email });
      if (!otpData) {
        return res.status(404).send({
          status: "failed",
          message: "OTP not found",
        });
      }
      if (!otpData.verified) {
        return res.status(404).send({
          status: "failed",
          message: "OTP not verified",
        });
      }
      const hash = await bcrypt.hash(newPassword, 8);

      var user = await User.findOneAndUpdate({ email }, { password: hash });
      if (!user) {
        return res.status(404).send({
          status: "failed",
          message: "User not found",
        });
      }
      await OTP.findOneAndDelete({ email });
      return res.status(200).send({
        status: "success",
        message: "Password changed successfully",
      });
    } catch (e) {
      return res.status(500).send({ status: "failed", message: e.message });
    }
  };

  static userInfo = (req, res) => {
    return res.status(200).json({
      status: "success",
      data: req.user,
      message: "User information",
    });
  };
}

module.exports = AccountController;
