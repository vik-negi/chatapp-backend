const { User, UserMe } = require("../schema/userSchema");
const { Chat, ChatMe } = require("../schema/chatSchema");

const { Mongoose, ObjectId } = require("mongoose");

class ChatController {
  static getUserChat = async (req, res) => {
    try {
      const { senderUserId, receiverUserId } = req.params;

      const dbChats = await Chat.findOne({
        senderUserId: senderUserId,
        receiverUserId: receiverUserId,
      });

      if (dbChats == null) {
        var ChatSender = await Chat({
          receiverUserId: receiverUserId,
          senderUserId: senderUserId,
        });
        var ChatReciever = await Chat({
          receiverUserId: senderUserId,
          senderUserId: receiverUserId,
        });
        await ChatSender.save();
        await ChatReciever.save();
        const dbChats = await Chat.findOne({
          senderUserId: senderUserId,
          receiverUserId: receiverUserId,
        });

        return res.status(200).json({
          status: "success",
          data: dbChats,
          message: "No chats found",
        });
      }
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
      const { receiverUserId, senderUserId, message, messageType } = data;

      if (!message) {
        return res.json({
          status: "failed",
          message: "Please provide all the fields",
        });
      }

      const dbChats = await Chat.findOne({
        senderUserId: senderUserId,
        receiverUserId: receiverUserId,
      });

      const recieverUser = await User.findById(receiverUserId);
      const user = await User.findById(senderUserId);
      const recieveBy = recieverUser.username;
      var chat = {
        message: message,
        receiverUserId: receiverUserId,
        senderUserId: senderUserId,
        sendBy: user.username,
        recieveBy: recieveBy,
        timestamp: Date.now(),
        isSent: true,
      };

      if (messageType) {
        chat.messageType = messageType;
      } else {
        chat.messageType = "text";
      }
      if (!dbChats) {
        await Chat.create({
          senderUserId: senderUserId,
          receiverUserId: receiverUserId,
          chat: [chat],
        });
        await ChatMe.create({
          senderUserId: senderUserId,
          receiverUserId: receiverUserId,
          chat: [chat],
        });
        await Chat.create({
          receiverUserId: senderUserId,
          senderUserId: receiverUserId,
          chat: [chat],
        });
        ChatMe.create({
          receiverUserId: senderUserId,
          senderUserId: receiverUserId,
          chat: [chat],
        });
        // Chat({
        //   senderUserId: senderUserId,
        //   receiverUserId: receiverUserId,
        //   chat: [],
        // });
        // var newChatMe = ChatMe({
        //   senderUserId: senderUserId,
        //   receiverUserId: receiverUserId,
        //   chat: [],
        // });
        // var newChatOther = Chat({
        //   receiverUserId: senderUserId,
        //   senderUserId: receiverUserId,
        //   chat: [],
        // });

        // var newChatOtherMe = ChatMe({
        //   receiverUserId: senderUserId,
        //   senderUserId: receiverUserId,
        //   chat: [],
        // });
        // recieverUser.chatWith.push({
        //   user: senderUserId,
        //   image: user.profileImage.url,
        //   lastMessage: chat,
        // });
        await User.findOneAndUpdate(
          { _id: receiverUserId },
          {
            $push: {
              chatWith: {
                user: senderUserId,
                image: user.profileImage.url,
                lastMessage: chat,
              },
            },
          },
          { new: true }
        );
        await UserMe.findOneAndUpdate(
          { _id: receiverUserId },
          {
            $push: {
              chatWith: {
                user: senderUserId,
                image: user.profileImage.url,
                lastMessage: chat,
              },
            },
          },
          { new: true }
        );
        await User.findOneAndUpdate(
          { _id: senderUserId },
          {
            $push: {
              chatWith: {
                user: receiverUserId,
                image: recieverUser.profileImage.url,
                lastMessage: chat,
              },
            },
          },
          { new: true }
        );

        await UserMe.findOneAndUpdate(
          { _id: senderUserId },
          {
            $push: {
              chatWith: {
                user: receiverUserId,
                image: recieverUser.profileImage.url,
                lastMessage: chat,
              },
            },
          },
          { new: true }
        );

        return {
          status: "success",
          data: nchat,
          message: "Message sent",
        };
      }

      await User.findOneAndUpdate(
        { _id: receiverUserId },
        {
          $push: {
            chatWith: {
              user: senderUserId,
              image: user.profileImage.url,
              lastMessage: chat,
            },
          },
        },
        { new: true }
      );
      await UserMe.findOneAndUpdate(
        { _id: receiverUserId },
        {
          $push: {
            chatWith: {
              user: senderUserId,
              image: user.profileImage.url,
              lastMessage: chat,
            },
          },
        },
        { new: true }
      );
      await User.findOneAndUpdate(
        { _id: senderUserId },
        {
          $push: {
            chatWith: {
              user: receiverUserId,
              image: recieverUser.profileImage.url,
              lastMessage: chat,
            },
          },
        },
        { new: true }
      );

      await UserMe.findOneAndUpdate(
        { _id: senderUserId },
        {
          $push: {
            chatWith: {
              user: receiverUserId,
              image: recieverUser.profileImage.url,
              lastMessage: chat,
            },
          },
        },
        { new: true }
      );

      await Chat.findOneAndUpdate(
        { senderUserId: senderUserId, receiverUserId: receiverUserId },
        {
          $push: {
            chat: chat,
          },
        },
        { new: true }
      );

      await ChatMe.findOneAndUpdate(
        { senderUserId: senderUserId, receiverUserId: receiverUserId },
        {
          $push: {
            chat: chat,
          },
        },
        { new: true }
      );
      await Chat.findOneAndUpdate(
        { senderUserId: receiverUserId, receiverUserId: senderUserId },
        {
          $push: {
            chat: chat,
          },
        },
        { new: true }
      );
      await ChatMe.findOneAndUpdate(
        { senderUserId: receiverUserId, receiverUserId: senderUserId },
        {
          $push: {
            chat: chat,
          },
        },
        { new: true }
      );

      const dbChatsnew = await Chat.findOne({
        senderUserId: senderUserId,
        receiverUserId: receiverUserId,
      });
      const nchat = dbChatsnew.chat[dbChatsnew.chat.length - 1];

      return {
        status: "success",
        data: nchat,
        message: "Message sent",
      };
    } catch (err) {
      return {
        status: "failed",
        message: err.message,
      };
    }
  };

  // Helper function to find chat documents

  // Main function to create a message
  // static createMessage = async (data) => {
  //   try {
  //     const { receiverUserId, senderUserId, message, messageType } = data;

  //     if (!message) {
  //       return {
  //         status: "failed",
  //         message: "Please provide all the fields",
  //       };
  //     }

  //     const { dbChats, dbChatsMe, dbChatsOther, dbChatsOtherMe } =
  //       await findChats(senderUserId, receiverUserId);

  //     const [recieverUser, user, recieverUserMe, userMe] = await Promise.all([
  //       User.findById(receiverUserId),
  //       User.findById(senderUserId),
  //       UserMe.findById(receiverUserId),
  //       UserMe.findById(senderUserId),
  //     ]);

  //     const recieveBy = recieverUser.username;

  //     const chat = {
  //       message,
  //       receiverUserId,
  //       senderUserId,
  //       sendBy: user.username,
  //       recieveBy,
  //       timestamp: Date.now(),
  //       isReceived: false,
  //       isRead: false,
  //       isPinned: false,
  //       isForwarded: false,
  //       isDeleted: false,
  //       isSent: true,
  //       messageType: messageType || "text",
  //     };

  //     if (!dbChats) {
  //       await createChat(senderUserId, receiverUserId, chat);

  //       recieverUser.chatWith.push({
  //         user: senderUserId,
  //         image: user.profileImage.url,
  //         lastMessage: chat,
  //       });
  //       recieverUserMe.chatWith.push({
  //         user: senderUserId,
  //         image: user.profileImage.url,
  //         lastMessage: chat,
  //       });
  //       user.chatWith.push({
  //         user: receiverUserId,
  //         image: recieverUser.profileImage.url,
  //         lastMessage: chat,
  //       });
  //       userMe.chatWith.push({
  //         user: receiverUserId,
  //         image: recieverUser.profileImage.url,
  //         lastMessage: chat,
  //       });

  //       await updateChatWith(
  //         recieverUser,
  //         user,
  //         recieverUserMe,
  //         userMe,
  //         senderUserId,
  //         receiverUserId,
  //         chat
  //       );

  //       return {
  //         status: "success",
  //         data: chat,
  //         message: "Message sent",
  //       };
  //     }

  //     await updateChatWith(
  //       recieverUser,
  //       user,
  //       recieverUserMe,
  //       userMe,
  //       senderUserId,
  //       receiverUserId,
  //       chat
  //     );

  //     dbChats.chat.push(chat);
  //     dbChatsOther.chat.push(chat);

  //     await Promise.all([
  //       dbChats.save(),
  //       dbChatsMe.save(),
  //       dbChatsOther.save(),
  //       dbChatsOtherMe.save(),
  //     ]);

  //     return {
  //       status: "success",
  //       data: chat,
  //       message: "Message sent",
  //     };
  //   } catch (err) {
  //     return {
  //       status: "failed",
  //       message: err.message,
  //     };
  //   }
  // };

  static getAllUser = async (req, res) => {
    try {
      const { senderUserId } = req.params;

      if (!senderUserId) {
        return res.status(404).json({
          status: "failed",
          message: "Invalid user",
        });
      }

      const chats = await Chat.find({
        senderUserId: senderUserId,
      });

      if (!chats) {
        return res.status(200).json({
          status: "failed",
          message: "No chats found",
          data: [],
        });
      }
      var allUser = [];

      for (let i = 0; i < chats.length; i++) {
        var id = chats[i].receiverUserId;
        const user = await User.findById(id);

        var lastMessage = chats[i].chat[chats[i].chat.length - 1];

        if (lastMessage !== undefined && lastMessage !== null) {
          allUser.push({
            receiverId: id,
            username: user.username,
            profilePic: user.profileImage["url"],
            lastMessage:
              lastMessage.message === null ? "" : lastMessage.message,
            lastMessageTime: lastMessage.timestamp,
            lastMessageBy: lastMessage.sendBy,
            name: user.name,
          });
        }
      }

      return res.status(200).json({
        status: "success",
        data: allUser,
        message: "Chats found",
      });
    } catch (err) {
      res.status(500).json({
        status: "failed",
        message: err.message,
      });
    }
  };

  static deleteChat = async (req, res) => {
    try {
      const { senderReceiverId } = req.params;
      const { idsForDelete } = req.body;
      if (!idsForDelete) {
        return res.status(404).json({
          status: "failed",
          message: "Please provide ids",
        });
      }
      var chatIds = JSON.parse(idsForDelete.replace(/(\w+)/g, '"$1"'));
      const chat = await Chat.findById(senderReceiverId);
      if (!chat) {
        return res.status(404).json({
          status: "failed",
          message: "No chat found",
        });
      }

      await Chat.updateOne(
        {
          _id: senderReceiverId,
        },
        {
          $pull: {
            chat: {
              _id: {
                $in: chatIds,
              },
            },
          },
        }
      );
      // await Chat.updateOne(
      //   {
      //     _id: senderReceiverId,
      //   },
      //   {
      //     $pull: {
      //       chat: {
      //         _id: chatId,
      //       },
      //     },
      //   }
      // );
      res.status(200).json({
        status: "success",
        message: "Chat deleted",
      });
    } catch (err) {
      res.status(500).json({
        status: "failed",
        message: err.message,
      });
    }
  };

  static setIsSent = async (req, res) => {
    try {
      const { senderReceiverId, chatId } = req.params;
      var id = Chat.findById(senderReceiverId).lastRead;
      if (!id) {
        id = Chat.findById(senderReceiverId).chat[0]._id;
      }

      await Chat.updateOne(
        { _id: senderReceiverId, "chat._id": { $gt: id } },
        { $set: { "chat.$.isSent": true } }
      );
    } catch (err) {
      res.status(500).json({
        status: "failed",
        message: err.message,
      });
    }
  };

  static deleteAllChat = async (req, res) => {
    try {
      const { senderUserId, receiverUserId } = req.params;
      const chats = await Chat.find({
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
      const chat = await Chat.findById(senderReceiverId);
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

      const result = await Chat.updateOne(
        { _id: senderReceiverId },
        update,
        options
      );
      return res.status(200).json({
        status: "success",
        message: `${select} updated`,
      });
    } catch (e) {}
  };
}

module.exports = ChatController;
