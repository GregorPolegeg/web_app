const { createServer } = require("http");
const { parse } = require("url");
const callSendMessage = require("./src/server/callUpdateSeen");
const next = require("next");
const { Server } = require("socket.io");
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(server, {
    path: "/api/socket/io",
    cors: {
      methods: "*",
    },
  });

  io.on("connection", (socket) => {
    socket.on("joinConversation", (newConversationId) => {
      if (!socket.rooms.has(newConversationId)) {
        socket.join(newConversationId);
      }
    });

    socket.on("responseIsActive", (payload) => {
      io.to(`${payload.conversationId}`).emit(
        "responseIsActive",
        payload.active,
        payload.senderId,
      );
    });

    socket.on("isActive", (payload) => {
      if (2 <= io.sockets.adapter.rooms.get(payload.conversationId).size) {
        io.to(`${payload.conversationId}`).emit(
          "isActive",
          payload.conversationId,
          payload.senderId,
        );
      } else {
        const senderId = payload.senderId
        io.to(`${payload.conversationId}`).emit(
          "responseIsActive",
          false,
          senderId,
        );
      }
    });

    socket.on("newMessage", (payload) => {
      io.to(`${payload.conversationId}`).emit(
        "newMessage",
        payload.conversationId,
        payload.message,
      );
    });

    socket.on("deleteMessage", (payload) => {
      io.to(`${payload.conversationId}`).emit(
        "messageDeleted",
        payload.messageId,
      );
    });
  });

  server.listen(3000, (err) => {
    if (err) throw err;
    console.log("> Ready on http://localhost:3000");
  });
});
