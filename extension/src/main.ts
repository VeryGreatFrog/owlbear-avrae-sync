import OBR from "@owlbear-rodeo/sdk";
import { createApp } from "vue";

import App from "./App.vue";
import room from "./managers/ChannelConnection.ts";
import "./style.css";
import "./socket.ts";

OBR.onReady(() => {
	createApp(App).mount("#app");

	room.init();
});

// OBR.onReady(() => {
// 	document.querySelector("#clear-tokens")?.addEventListener("click", async () => {
// 		console.log("is clicked");
// 		const currentAttachments = await OBR.scene.items.getItems<Shape>((item) => {
// 			const metadata = item.metadata[getPluginId("metadata")];
// 			return Boolean(isPlainObject(metadata));
// 		});
// 		console.log(currentAttachments);
// 		await OBR.scene.items.deleteItems(currentAttachments.map(a => a.id));
// 	});

// 	document.querySelector("#resync-state")?.addEventListener("click", async () => {
// 		clearCombatantCache();
// 		const response = await fetch(`/api/getInit/${(document.querySelector("#channel-id") as HTMLInputElement).value}`);
// 		const content: Record<string, CombatantData> = await response.json();
// 		updateCombatants2(content);
// 	});
// });
