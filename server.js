// server.js
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
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
      methods: "*"
    },
  });

  io.on('connection', (socket) => {
    
    socket.on("joinConversation", (newConversationId) => {
        const currentRooms = socket.rooms;
        currentRooms.forEach(room => {
            if (room !== socket.id) {
                socket.leave(room);
            }
        });
        socket.join(`${newConversationId}`);
    });

    socket.on("newMessage", (payload) => {
        // Emit the message with the conversationId as the first parameter
        io.to(`${payload.conversationId}`).emit('newMessage', payload.conversationId, payload.message);
    });
});




  server.listen(3000, (err) => {
    if (err) throw err;
    console.log('> Ready on http://localhost:3000');
  });
});