import OBR from "@owlbear-rodeo/sdk";

import { reactive } from "vue";
import { getPluginId } from "../helper";
import { socket } from "../socket";
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
			OBR.broadcast.sendMessage(getPluginId("broadcastChannel"), id);
		});

		// Request the server to watch the channel

		if (id !== "") socket.emit("startWatching", id, (response: { status: "ok" | "error"}) => {
			console.log(response.status)
		})
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

		OBR.room.setMetadata({ [getPluginId("roomSettings")]: { guildId: id, channelId: this.channelId } }).then(() => {
			OBR.broadcast.sendMessage(getPluginId("broadcastGuild"), id);
		});
		await this.setChannel("", true)

		this.guildId = id;

	},

	// Initialize effects for this ChannelConnection
	async init() {
		// Load the current metadata
		const metadata = await OBR.room.getMetadata();
		this.channelId = (metadata[getPluginId("roomSettings")] as any).channelId;
		this.guildId = (metadata[getPluginId("roomSettings")] as any).guildId;

		// register broadcast events
		OBR.broadcast.onMessage(getPluginId("broadcastChannel"), (event: any) => { this.channelId = event.data; });
		OBR.broadcast.onMessage(getPluginId("broadcastGuild"), (event: any) => { this.guildId = event.data; });
	},
});
