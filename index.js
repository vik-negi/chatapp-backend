const express = require("express");
const mongoose = require("mongoose");
const config = require("config");
const morgan = require("morgan");
const dotenv = require("dotenv");
const http = require("http");
const cors = require("cors");
const bodyParser = require("body-parser");
const ChatController = require("./controllers/chatController.js");
const { User } = require("./schema/userSchema.js");
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const app = express();

const server = http.createServer(app);
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(cors());

//* BorderParser Middleware
app.use(express.json());

//* Load Env
dotenv.config();

//* Connect DB
//* Log route actions
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// socket io
var io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});
const PushNotification = require("./controllers/push_notification.js");
const client = new Map();
io.on("connection", (socket) => {
  socket.on("join", (room) => {
    socket.join(room);
  });
  socket.on("signin", (id) => {
    socket.user = {
      id: id,
    };
    client.set(id, socket);
  });
  socket.on("message", async (message) => {
    let receiverUserId = message.receiverUserId;
    const receiverSocket = client.get(receiverUserId);
    var returnData = await ChatController.createMessage(message);
    const sender = await User.findById(message.senderUserId);
    const receiver = await User.findById(message.receiverUserId);
    if (sender._id == receiver._id) {
      return;
    }

    if (receiverSocket) {
      await receiverSocket.emit("message", returnData);
    } else {
      PushNotification.SendNotificationInternal({
        messageData: message.message,
        title: sender.name,
        deviceNotificationId: [receiver.deviceNotificationId],
        small_icon: sender.profileImage.url,
        large_icon: sender.profileImage.url,
      });
    }
    // io.to(message.room).emit("message", message);
  });
  socket.on("disconnect", () => {
    if (socket.user.id) {
      client.delete(socket.user.id);
    }
  });
});

// Routes
const chatRouter = require("./routes/chat.js");
const accountRouter = require("./routes/account.js");

// let cpUpload = multerUploads.fields([{ name: "image", maxCount: 4 }]);
app.use("/account", accountRouter);
app.use(
  "/chat",
  (req, res, next) => {
    console.log("chat");
    next();
  },
  chatRouter
);
app.use("/send", require("./routes/notification.js"));
app.use("/demo", (req, res) => {
  return res.json({
    msg: "Hello World",
  });
});

const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
