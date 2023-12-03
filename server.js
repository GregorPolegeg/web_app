// @ts-nocheck

const { createServer } = require("http");
const { parse } = require("url");
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
    const memberData = activeMembers[conversationId]?.[otherMemberId];
    if (memberData) {
      return Object.values(memberData).some((value) => value === true);
    }
    return false;
  }

  io.on("connection", (socket) => {
    //seen
    socket.on("activeOnConversation", ({ conversationId, memberId }) => {
      if (conversationId !== "t") {
        if (!activeMembers[conversationId]) {
          activeMembers[conversationId] = [];
        }

        if (!activeMembers[conversationId][memberId]) {
          activeMembers[conversationId][memberId] = [];
        }
        if (!activeMembers[conversationId][memberId][socket.id]) {
          activeMembers[conversationId][memberId][socket.id] = [];
        }
        activeMembers[conversationId][memberId][socket.id] = true;
      }
    });

    socket.on("callDanny", ({ conversationId, memberId }) => {
      const conversation = activeMembers[conversationId];
    
      if (conversation) {
        const memberIds = Object.keys(conversation);
        if (memberIds.length === 1 && memberIds.includes(memberId)) {
          socket.emit("dannyNotAvailable");
          return;
        }
        for (const otherMemberId in conversation) {
          if (otherMemberId !== memberId) {
            const socketIds = Object.keys(conversation[otherMemberId]);
            if (socketIds.length === 0) {
              socket.emit("dannyNotAvailable");
            } else {
              for (const socketId of socketIds) {
                io.to(socketId).emit("wakeUp", conversationId);
              }
            }
          }
        }
      }
    });
    
    socket.on("disconnectOnConversation", ({ conversationId, memberId }) => {
      if (
        activeMembers[conversationId] &&
        activeMembers[conversationId][memberId]
      ) {
        const socketIndex = activeMembers[conversationId][memberId][socket.id];
        if (socketIndex) {
          activeMembers[conversationId][memberId][socket.id] = false;
        }
      }
    });

    socket.on("disconnect", () => {
      for (const conversationId in activeMembers) {
        for (const memberId in activeMembers[conversationId]) {
          if (
            activeMembers[conversationId][memberId][socket.id] == true ||
            activeMembers[conversationId][memberId][socket.id] == false
          ) {
            delete activeMembers[conversationId][memberId][socket.id];

            if (activeMembers[conversationId][memberId].length === 0) {
              delete activeMembers[conversationId][memberId];

              if (Object.keys(activeMembers[conversationId]).length === 0) {
                delete activeMembers[conversationId];
              }
            }
          }
        }
      }
    });

    socket.on("joinConversation", (newConversationId) => {
      if (!socket.rooms.has(newConversationId)) {
        socket.join(newConversationId);
      }
    });

    socket.on("isActive", (payload) => {
      const active = isMemberActive(
        payload.conversationId,
        payload.otherMemberId,
      );
      socket.emit("responseIsActive", active);
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
