import OBR from "@owlbear-rodeo/sdk";

import { reactive } from "vue";
import { getPluginId } from "../helper";

export default reactive({
	// The discord channel ID this room is connected to
	channelId: "",
	// The discord guild ID this room is optionally connected to
	guildId: "",
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

		this.channelId = id;
		OBR.room.setMetadata({ [getPluginId("roomSettings")]: { channelId: id, guildId: this.guildId } }).then(() => {
			OBR.broadcast.sendMessage(getPluginId("broadcastSettings"), id);
		});
	},
	async setGuild(id: string, acceptEmpty = false) {
		if (!acceptEmpty && id.length <= 16) {
			await OBR.notification.show("That is not a valid guild ID.", "ERROR");
			return;
		}

		const player = OBR.player;
		const isGM = await player.getRole() === "GM";

		if (!isGM)
			return;
		
		OBR.room.setMetadata({ [getPluginId("roomSettings")]: { guildId: id, channelId: "" } }).then(() => {
			OBR.broadcast.sendMessage(getPluginId("broadcastGuild"), { guildId: id, channelId: ""});
		});
		// await this.setChannel("", true)
		console.log("Set to ", await OBR.room.getMetadata())
		this.guildId = id;
	},

	// Initialize effects for this ChannelConnection
	async init() {
		// Load the current metadata
		const metadata = await OBR.room.getMetadata();
		this.channelId = (metadata[getPluginId("roomSettings")] as any)?.channelId || "";
		this.guildId = (metadata[getPluginId("roomSettings")] as any)?.guildId || "";
		// register broadcast events
		OBR.broadcast.onMessage(getPluginId("broadcastSettings"), (event: any) => { this.guildId = event.data.guildId; this.channelId = event.data.channelId });
	},
});
