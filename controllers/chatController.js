const UserModel = require("../schema/userSchema");
const ChatModel = require("../schema/chatSchema");
const { Mongoose, ObjectId } = require("mongoose");

class ChatController {
  static getUserChat = async (req, res) => {
    try {
      const { senderUserId, receiverUserId } = req.params;
      const dbChats = await ChatModel.findOne({
        $or: [{ senderUserId: senderUserId }, { senderUserId: receiverUserId }],
      });

      if (!dbChats || dbChats == []) {
        return res.status(404).json({
          status: "failed",
          message: "No chats found",
        });
      }
      // console.log(dbChats);
      // console.log("hiiiii");

      // const chats = [...senderChats.chat, ...receiverChats.chat];
      dbChats.chat.sort(function (a, b) {
        return Number(a.timestamp) - Number(b.timestamp);
      });

      res.status(200).json({
        status: "success",
        data: dbChats,
        message: "Chats found",
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };

  static createMessage = async (data) => {
    try {
      // console.log("req.body", req.body);
      const { receiverUserId, senderUserId, message, messageType } = data;
      console.log(receiverUserId, senderUserId, message);

      if (!message) {
        return json({
          status: "failed",
          message: "Please provide all the fields",
        });
      }

      const dbChats = await ChatModel.findOne({
        $or: [
          { senderUserId: senderUserId },
          { receiverUserId: receiverUserId },
        ],
      });
      const dbChatsOther = await ChatModel.findOne({
        $or: [
          { senderUserId: receiverUserId },
          { receiverUserId: senderUserId },
        ],
      });

      const recieverUser = await UserModel.findById(receiverUserId);
      const user = await UserModel.findById(senderUserId);
      const recieveBy = recieverUser.username;
      var chat = {
        message: message,
        receiverUserId: receiverUserId,
        senderUserId: senderUserId,
        sendBy: user.username,
        recieveBy: recieveBy,
        timestamp: Date.now(),
        isReceived: false,
        isRead: false,
        isPinned: false,
        isForwarded: false,
        isDeleted: false,
        isSent: true,
      };
      console.log("chat", chat);

      if (messageType) {
        chat.messageType = messageType;
      } else {
        chat.messageType = "text";
      }
      // console.log(dbChats);
      if (!dbChats) {
        var newChat = ChatModel({
          senderUserId: senderUserId,
          receiverUserId: receiverUserId,
          chat: [],
        });
        var newChatOther = ChatModel({
          receiverUserId: senderUserId,
          senderUserId: receiverUserId,
          chat: [],
        });
        recieverUser.chatWith.push({
          user: senderUserId,
          image: user.profileImage.url,
          lastMessage: chat,
        });
        user.chatWith.push({
          user: receiverUserId,
          image: recieverUser.profileImage.url,
          lastMessage: chat,
        });
        user.save();
        recieverUser.save();
        newChat.chat.push(chat);
        newChatOther.chat.push(chat);

        await newChat.save();
        await newChatOther.save();
        return {
          status: "success",
          data: nchat,
          message: "Message sent",
        };
      }

      for (let i = 0; i < recieverUser.chatWith.length; i++) {
        if (recieverUser.chatWith[i].user == senderUserId) {
          recieverUser.chatWith[i].lastMessage = chat;
        }
      }
      for (let i = 0; i < user.chatWith.length; i++) {
        if (user.chatWith[i].senderUserId == receiverUserId) {
          user.chatWith[i].lastMessage = chat;
        }
      }
      await recieverUser.save();
      dbChats.chat.push(chat);
      dbChatsOther.chat.push(chat);
      await dbChats.save();
      await dbChatsOther.save();
      const nchat = dbChats.chat[dbChats.chat.length - 1];

      return {
        status: "success",
        data: nchat,
        message: "Message sent",
      };
    } catch (err) {
      console.log("err", err);
      return {
        status: "failed",
        message: err.message,
      };
    }
  };

  static getAllUser = async (req, res) => {
    try {
      const { senderUserId } = req.params;

      if (!senderUserId) {
        return res.status(404).json({
          status: "failed",
          message: "Invalid user",
        });
      }
      console.log("senderUserId", senderUserId);

      const chats = await ChatModel.find({ senderUserId: senderUserId });
      console.log("chats : ", chats);
      if (!chats) {
        return res.status(200).json({
          status: "failed",
          message: "No chats found",
          data: [],
        });
      }
      var allUser = [];

      for (let i = 0; i < chats.length; i++) {
        console.log("chat", chats[i]);
        var id = chats[i].receiverUserId;

        console.log("id", id);
        const user = await UserModel.findById(id);

        var lastMessage = chats[i].chat[chats[i].chat.length - 1];
        allUser.push({
          receiverId: id,
          username: user.username,
          profilePic: user.profileImage["url"],
          lastMessage: lastMessage.message,
          lastMessageTime: lastMessage.timestamp,
          lastMessageBy: lastMessage.sendBy,
          name: user.name,
        });
      }

      console.log(allUser);
      return res.status(200).json({
        status: "success",
        data: allUser,
        message: "Chats found",
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };

  static deleteChat = async (req, res) => {
    try {
      const { senderReceiverId, chatId } = req.params;
      console.log("chatId : ", chatId);
      const chat = await ChatModel.findById(senderReceiverId);
      if (!chat) {
        return res.status(404).json({
          status: "failed",
          message: "No chat found",
        });
      }
      await ChatModel.updateOne(
        {
          _id: senderReceiverId,
        },
        {
          $pull: {
            chat: {
              _id: chatId,
            },
          },
        }
      );
      res.status(200).json({
        status: "success",
        message: "Chat deleted",
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };

  static deleteAllChat = async (req, res) => {
    try {
      const { senderUserId, receiverUserId } = req.params;
      console.log("senderUserId : ", senderUserId);
      console.log("receiverUserId : ", receiverUserId);
      const chats = await ChatModel.find({
        $or: [
          {
            senderUserId: senderUserId,
            receiverUserId: receiverUserId,
          },
          {
            senderUserId: receiverUserId,
            receiverUserId: senderUserId,
          },
        ],
      });
      if (!chats) {
        return res.status(404).json({
          status: "failed",
          message: "No chat found",
        });
      }
      chats.forEach(async (chat) => {
        await chat.remove();
      });
      res.status(200).json({
        status: "success",
        message: "Chat deleted",
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };

  static functionality = async (req, res) => {
    try {
      const { isPinned, isForwarded, reaction, isReceived, isDeleted, isRead } =
        req.body;
      const { senderReceiverId, chatId } = req.params;
      const chat = await ChatModel.findById(senderReceiverId);
      if (!chat) {
        return res.status(404).json({
          status: "failed",
          message: "No chat found",
        });
      }
      var select;
      var update = {};
      if (isPinned) {
        select = "isPinned";
        update = {
          $set: {
            "chat.$[element].isPinned": isPinned == "true" ? true : false,
          },
        };
      } else if (isForwarded) {
        select = "isForwarded";
        update = {
          $set: {
            "chat.$[element].isForwarded": true,
          },
        };
      } else if (reaction) {
        select = "reaction";
        chat.reaction = reaction;
      } else if (isReceived) {
        select = "isReceived";
        update = {
          $set: {
            "chat.$[element].isReceived": true,
          },
        };
      } else if (isRead) {
        select = "isRead";
        update = {
          $set: {
            "chat.$[element].isRead": true,
          },
        };
      } else {
        return res.status(200).json({
          status: "failed",
          message: `No ${select} found`,
        });
      }

      const options = {
        arrayFilters: [{ "element._id": chatId }],
      };

      const result = await ChatModel.updateOne(
        { _id: senderReceiverId },
        update,
        options
      );
      return res.status(200).json({
        status: "success",
        message: `${select} updated`,
      });
    } catch (e) {
      console.log(e);
    }
  };
}

module.exports = ChatController;
