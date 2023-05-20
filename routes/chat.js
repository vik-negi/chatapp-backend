const Router = require("express");
const ChatController = require("../controllers/chatController.js");
const checkUserAuth = require("../middleware/auth-middleware.js");
const chatMiddleware = require("../middleware/chatMiddleware.js");

const chatRouter = Router();

chatRouter.post(
  "/sendMessage/:senderUserId/:receiverUserId",
  checkUserAuth,
  chatMiddleware,
  ChatController.createMessage
);
chatRouter.get(
  "/getChats/:senderUserId/:receiverUserId",
  checkUserAuth,
  chatMiddleware,
  ChatController.getUserChat
);
chatRouter.get(
  "/getAllUser/:senderUserId",
  checkUserAuth,
  ChatController.getAllUser
);
chatRouter.get(
  "/setIsSent/:senderUserId/:chatId",
  checkUserAuth,
  ChatController.setIsSent
);
chatRouter.post(
  "/deleteChat/:senderReceiverId",
  checkUserAuth,
  ChatController.deleteChat
);
chatRouter.post(
  "/functionality/:senderReceiverId/:chatId",
  checkUserAuth,
  ChatController.functionality
);

module.exports = chatRouter;
