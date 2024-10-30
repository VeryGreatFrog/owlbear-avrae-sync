import { io } from 'socket.io-client';
import { updateCombatants2 } from './attachments';

const socket = io("", {transports: ['websocket', 'polling', 'flashsocket']})

socket.connect()
export interface CombatantData {
	name: string;
	isPlayer: boolean;
	isMonster: boolean;
	isGenericCombatant: boolean;
	// generic or monsters
	hpStatus?: string;

	// Player character
	hp?: number;
	maxHp?: number;
	thp?: number;
	ac?: number;

	// Anyone
	conditions?: string;
}

socket.on("initUpdate", async (channelId) => {
    console.log("Received an init update for " + channelId)
    if (channelId === (document.querySelector("#channel-id") as HTMLInputElement).value) {
        const response = await fetch(`/api/getInit/${channelId}`)
        const content : Record<string, CombatantData> = await response.json()
        updateCombatants2(content)
    }
})