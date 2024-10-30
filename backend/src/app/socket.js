import { Server } from "socket.io";
let io;
export const initSocket = (server) => {
    io = new Server(server);
    io.on("connection", () => console.log("Socket connected"));
};
export const getIO = () => {
    if (!io) {
        throw new Error("Socket.IO not initialized");
    }
    return io;
};
export const broadcastInit = (channelId) => {
    getIO().volatile.emit("initUpdate", channelId);
};
