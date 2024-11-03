import type { Shape } from "@owlbear-rodeo/sdk";
import type { CombatantData } from "./socket.ts";
import OBR from "@owlbear-rodeo/sdk";
import { clearCombatantCache, updateCombatants2 } from "./attachments.ts";

import { getPluginId, isPlainObject } from "./helper.ts";
import "./style.css";
import "./socket.ts";

console.log("yes");
OBR.onReady(() => {
	document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
    <h1> Avrae Owlbear Sync </h1>
    <div> Select a discord channel to link to: 1301245033302851614 </div>
    <input type="text" placeholder="Channel ID" id="channel-id" value="1301245033302851614"/>
    <button type="button" id="clear-tokens"> Clear all effects </button>
    <button type="button" id="resync-state"> Force a resync </button>
  </div>
`;
});

OBR.onReady(() => {
	document.querySelector("#clear-tokens")?.addEventListener("click", async () => {
		console.log("is clicked");
		const currentAttachments = await OBR.scene.items.getItems<Shape>((item) => {
			const metadata = item.metadata[getPluginId("metadata")];
			return Boolean(isPlainObject(metadata));
		});
		console.log(currentAttachments);
		await OBR.scene.items.deleteItems(currentAttachments.map(a => a.id));
	});

	document.querySelector("#resync-state")?.addEventListener("click", async () => {
		clearCombatantCache();
		const response = await fetch(`/api/getInit/${(document.querySelector("#channel-id") as HTMLInputElement).value}`);
		const content: Record<string, CombatantData> = await response.json();
		updateCombatants2(content);
	});
});
