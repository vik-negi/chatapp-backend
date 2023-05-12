const express = require("express");
const mongoose = require("mongoose");
const config = require("config");
const morgan = require("morgan");
const dotenv = require("dotenv");
const http = require("http");
const cors = require("cors");
const bodyParser = require("body-parser");
const ChatController = require("./controllers/chatController.js");
const UserModel = require("./schema/userSchema.js");
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
const db = config.get("mongoURI");
mongoose
  .connect(db, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => console.log("Mongodb is connected..."))
  .catch((err) => console.log(err));

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
  console.log("a user connected");
  socket.on("join", (room) => {
    console.log("joined room", room);
    socket.join(room);
  });
  socket.on("signin", (id) => {
    console.log(socket.id, "has signin");
    console.log(id, "id has signin");
    socket.user = {
      id: id,
    };
    client.set(id, socket);
    console.log(socket);
  });
  socket.on("message", async (message) => {
    let receiverUserId = message.receiverUserId;
    console.log("message", message);
    console.log("message", receiverUserId);
    console.log(client[receiverUserId]);
    const receiverSocket = client.get(receiverUserId);
    var returnData = await ChatController.createMessage(message);
    const sender = await UserModel.findById(message.senderUserId);
    console.log("user sender : ", sender);
    if (receiverSocket) {
      console.log(returnData);
      await receiverSocket.emit("message", returnData);
    } else {
      PushNotification.SendNotificationInternal({
        messageData: message.message,
        title: sender.name,
        deviceNotificationId: sender.deviceNotificationId,
        small_icon: sender.profileImage.url,
        large_icon: sender.profileImage.url,
      });
    }
    // io.to(message.room).emit("message", message);
  });
  socket.on("disconnect", () => {
    console.log("user disconnected");
    client.delete(socket.user.id);
  });
});

// Routes
const chatRouter = require("./routes/chat");
const accountRouter = require("./routes/account");

// let cpUpload = multerUploads.fields([{ name: "image", maxCount: 4 }]);
app.use("/account", accountRouter);
app.use("/chat", chatRouter);
app.use("/send", require("./routes/notification.js"));
app.use("/", (req, res) => {
  return res.json({
    msg: "Hello World",
  });
});

const port = process.env.PORT || 5000;

server.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
