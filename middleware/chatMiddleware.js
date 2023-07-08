const { User } = require("../schema/userSchema.js");
var chatMiddleware = async (req, res, next) => {
  const { receiverUserId, senderUserId } = req.params;
  if (!receiverUserId || !senderUserId) {
    return res.status(400).json({
      status: "failed",
      message: "Please provide all the fields",
    });
  }
  const senderUser = await User.findById(senderUserId);
  const receiverUser = await User.findById(receiverUserId);
  if (!senderUser || !receiverUser) {
    return res.status(404).json({
      status: "failed",
      message: "User not found",
    });
  }
  next();
};
module.exports = chatMiddleware;
