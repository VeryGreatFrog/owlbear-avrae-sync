import type { CombatantData } from "../socket";
import OBR from "@owlbear-rodeo/sdk";
/* eslint-disable unused-imports/no-unused-vars */
import { reactive } from "vue";
import { getPluginId } from "../helper";
import tokenManager from "./TokenManager";

export default reactive({
	// The discord channel ID this room is connected to
	channelID: "",
	// The ID of the Owlbear user who is responsible for receiving the updates and making the requests to the owlbear API
	updaterID: "",
	// The unix timestamp of the last received update
	lastUpdateMs: 0,
	async setChannel(id: string, acceptEmpty = false) {
		if (!acceptEmpty && id.length <= 16) {
			await OBR.notification.show("That is not a valid channel ID.");
		}

		const player = OBR.player;
		const isGM = await player.getRole() === "GM";

		if (!isGM)
			return;

		this.channelID = id;
		OBR.room.setMetadata({ [getPluginId("roomSettings")]: { channelId: id } }).then(() => {
			OBR.broadcast.sendMessage(getPluginId("broadcastChannel"), id);
		});
	},

	// Initialize effects for this ChannelConnection
	async init() {
		// Load the current channel ID
		const metadata = await OBR.room.getMetadata();
		this.channelID = (metadata[getPluginId("roomSettings")] as any).channelId;

		// register broadcast events
		OBR.broadcast.onMessage(getPluginId("broadcastChannel"), (event: any) => { this.channelID = event.data; });
	},
	setUpdater(id: string) {
		//
	}
});
