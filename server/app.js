const express = require("express");
const socketIO = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const Message = require("./models/Message");
const messageController = require("./controllers/message");
const formatMessage = require("./utils/formatMsg");
const {
  saveUser,
  getDisconnectUser,
  getSameroomUsers,
} = require("./utils/user");

const app = express();
app.use(cors());
app.get("/chat/:roomName", messageController.getOldMessage);

mongoose.connect(process.env.MONGO_URL).then((_) => {
  console.log("connected to database");
});

const server = app.listen(4000, (_) => {
  console.log("server is running at port 4000");
});

const io = socketIO(server, {
  cors: "*",
});

// run when client connect to server
io.on("connection", (socket) => {
  const BOT = "room manager bot";
  socket.on("joined_room", (data) => {
    const { username, room } = data;
    const user = saveUser(socket.id, username, room);
    socket.join(user.room);

    socket.emit("message", formatMessage(BOT, "Welcome to the room!"));
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(BOT, `${user.username} user joined the room`)
      );

    socket.on("message_send", (data) => {
      io.to(user.room).emit("message", formatMessage(user.username, data));
      // store message db
      Message.create({
        username: user.username,
        message: data,
        room: user.room,
      });
    });

    io.to(user.room).emit("room_users", getSameroomUsers(user.room));
  });

  socket.on("disconnect", (_) => {
    const user = getDisconnectUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage(BOT, `${user.username} user left the room`)
      );
    }
  });
});
