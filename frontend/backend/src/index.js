import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";
import { Server } from "socket.io";

dotenv.config({
  path: "./env",
});

await connectDB();
const server = app.listen(process.env.PORT || 8000, () => {
  console.log(`Server is running at PORT: ${process.env.PORT}`);
});

const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  },
});

global.onlineUsers = new Map();
io.on("connection", (socket) => {
  global.chatSocket = socket;
  socket.on("add-user", (userId) => {
    console.log("User added!!");
    onlineUsers.set(userId, socket.id);
  });

  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      console.log("message sent!!");
      socket.to(sendUserSocket).emit("msg-recieve", data.msg);
    }
  });
});
