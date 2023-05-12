const UserModel = require("../schema/userSchema.js");
var chatMiddleware = async (req, res, next) => {
  const { receiverUserId, senderUserId } = req.params;
  if (!receiverUserId || !senderUserId) {
    return res.status(400).json({
      status: "failed",
      message: "Please provide all the fields",
    });
  }
  const senderUser = await UserModel.findById(senderUserId);
  const receiverUser = await UserModel.findById(receiverUserId);
  if (!senderUser || !receiverUser) {
    return res.status(404).json({
      status: "failed",
      message: "User not found",
    });
  }
  next();
};
module.exports = chatMiddleware;
