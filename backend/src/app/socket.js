import { Server } from "socket.io";
import { getChannels, startWatching } from "../discord-bot/events/ready";
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
        socket.on("startWatching", async (channelId, callback) => {
            try {
                startWatching(channelId);
                callback({
                    status: "ok"
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
