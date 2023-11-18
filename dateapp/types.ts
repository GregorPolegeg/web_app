import { Server as NetServerm, Socket } from "net";
import { NextApiResponse } from "next";
import { NextServer } from "next/dist/server/next";
import { Server as ServerIoServer } from "socket.io"


export type NextApiResponseServerIo = NextApiResponse & {
    socket: Socket &{
        server: NextServer &{
            io: ServerIoServer;
        };
    };
};