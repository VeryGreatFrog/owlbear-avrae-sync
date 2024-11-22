import { Server } from "socket.io";
import { getChannels } from "../discord-bot/events/ready.js";
let io;
export const initSocket = (server) => {
    io = new Server(server);
    io.on("connection", (socket) => {
        console.log("Socket connected");
        socket.on("getChannels", async (guildId, callback) => {
            try {
                const guildData = await getChannels(guildId);
                callback({
                    status: "ok",
                    data: guildData
                });
            }
            catch (e) {
                callback({
                    status: "error",
                    errror: e
                });
            }
        });
    });
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
