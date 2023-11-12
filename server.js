<<<<<<< HEAD
// @ts-nocheck
=======
>>>>>>> 7fa9c5140dd2143fc4386144af32cbbdef13d6f1
const { createServer } = require("http");
const { parse } = require("url");
const callSendMessage = require("./src/server/callUpdateSeen");
const next = require("next");
const { Server } = require("socket.io");
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();
const activeMembers = {};

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

  function isMemberActive(conversationId, otherMemberId) {
    return activeMembers[conversationId] && activeMembers[conversationId].includes(otherMemberId);
  }

  io.on("connection", (socket) => {
<<<<<<< HEAD
    //seen
    socket.on("activeOnConversation", ({ conversationId, memberId }) => {
      if (!activeMembers[conversationId]) {
        activeMembers[conversationId] = [];
      }
      if (!activeMembers[conversationId].includes(memberId)) {
        activeMembers[conversationId].push(memberId);
      }
    });

    socket.on("disconnectOnConversation", ({ conversationId, memberId }) => {
      console.log(conversationId);
      if (activeMembers[conversationId]) {
        const index = activeMembers[conversationId].indexOf(memberId);
        if (index !== -1) {
          activeMembers[conversationId].splice(index, 1);
        }
      }
    });

=======
>>>>>>> 7fa9c5140dd2143fc4386144af32cbbdef13d6f1
    socket.on("joinConversation", (newConversationId) => {
      if (!socket.rooms.has(newConversationId)) {
        socket.join(newConversationId);
      }
    });

<<<<<<< HEAD
    socket.on("isActive", (payload) => {
      const active = isMemberActive(payload.conversationId, payload.otherMemberId);
      socket.emit("responseIsActive", active);
=======
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
>>>>>>> 7fa9c5140dd2143fc4386144af32cbbdef13d6f1
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
