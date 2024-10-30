import { Server } from "socket.io";

let io: Server;

export const initSocket = (server: any) => {
	io = new Server(server);
	io.on("connection", () => console.log("Socket connected"));
};

export const getIO = () => {
	if (!io) {
		throw new Error("Socket.IO not initialized");
	}
	return io;
};

export const broadcastInit = (channelId: string) => {
	getIO().volatile.emit("initUpdate", channelId);
};
