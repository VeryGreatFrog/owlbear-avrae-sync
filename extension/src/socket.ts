import { io } from "socket.io-client";
import room from "./managers/ChannelConnection";
import tokenManager from "./managers/TokenManager";

export const socket = io(import.meta.env.DEV ? "http://localhost:3000" : "", { transports: ["websocket", "polling", "flashsocket"] });

socket.connect();
export interface CombatantData {
	name: string;
	// generic or monsters
	hpStatus?: string;

	// Player character
	hp?: number;
	maxHp?: number;
	thp?: number;
	ac?: number;

	// Anyone
	conditions?: string;
	isCurrentTurn?: string;
}

socket.on("initUpdate", async (channelId) => {
	if (channelId === room.channelId) {
		tokenManager.runEffects();
	}
});
