const UserModel = require("../schema/userSchema");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

class AccountController {
  static signup = async (req, res) => {
    const { username, password, name, mobile, email, deviceNotificationId } =
      req.body;
    var emailOrMobile = null;

    if (
      req.body["username"] &&
      req.body["password"] &&
      req.body["name"] &&
      req.body["deviceNotificationId"] &&
      (req.body["email"] || req.body["mobile"])
    ) {
      if (req.body["email"]) {
        emailOrMobile = req.body["email"].toLowerCase();
        const emailExists = await UserModel.findOne({ email: emailOrMobile });
        if (emailExists) {
          return res.json({
            status: "failed",
            message: "Email already exists",
          });
        }
      }
      if (req.body["mobile"]) {
        emailOrMobile = req.body["mobile"].toLowerCase();
        const mobileExists = await UserModel.findOne({ mobile: emailOrMobile });
        if (mobileExists) {
          return res.status(400).json({
            status: "failed",
            message: "Mobile number already exists",
          });
        }
      }
      try {
        const user = await UserModel.findOne({ username: username });
        if (user) {
          return res.status(400).json({ message: "Username already exists" });
        }
        const id = new Date().toJSON();
        const existing = await UserModel.findOne({
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

        const newUser = new UserModel({
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
          user = await UserModel.findOne({ username: username }).select(
            "+password"
          );
        } else {
          user = await UserModel.findOne({ email: email }).select("+password");
        }
        if (user) {
          const isvalidPassword = await bcrypt.compare(password, user.password);
          if (isvalidPassword) {
            const id = user._id;
            const token = jwt.sign({ _id: id }, process.env.JWT_SECRET_KEY, {
              expiresIn: 604800,
            });
            res.status(200).json({
              status: "success",
              token: token,
              data: user,
              message: "User logged in successfully",
            });
          } else {
            res.status(400).json({
              status: "failed",
              message: "Invalid Credientials",
            });
          }
        } else {
          res.status(400).json({
            status: "failed",
            message: "User not found",
          });
        }
      } catch (err) {
        res.status(400).json({
          status: "failed",
          message: err.message,
        });
      }
    } else {
      res.status(400).json({
        status: "failed",
        message: "All fields are required",
      });
    }
  };

  static searchUser = async (req, res) => {
    const { username } = req.params;
    if (username) {
      try {
        const users = await UserModel.find({
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
        console.log(err);
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
  static userInfo = (req, res) => {
    res.status(200).json({
      status: "success",
      data: req.user,
      message: "User information",
    });
  };
}

module.exports = AccountController;