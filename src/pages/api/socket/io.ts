
import {Server as NetServer} from "http"

import { NextApiRequest } from "next"
import {Server as ServerIO} from "socket.io"


import { NextApiResponseServerIo } from "types"

export const config = {
    api: {
        bodyParser: false,
    },
};

const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIo) => {
    if (!res.socket.server.io) {
        const httpServer: NetServer = res.socket.server as any;
        const io = new ServerIO(httpServer, {
            path: "/api/socket/io",
        });

        io.on("connection", (socket) => {
            console.log("a user connected");

            // Add more event listeners as needed.
            socket.on("disconnect", () => {
                console.log("user disconnected");
            });

            socket.on('sendMessage', (data) => {
                io.emit('newMessage', data);
            });
        });

        res.socket.server.io = io;
    }

    res.end();
};

export default ioHandler;