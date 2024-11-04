import type { BoundingBox, Image, Item, Shape } from "@owlbear-rodeo/sdk";
import type { CombatantData } from "../socket";
import OBR, { isImage } from "@owlbear-rodeo/sdk";

import { reactive } from "vue";
import { getPluginId, isPlainObject } from "../helper";
import room from "./ChannelConnection";
import { buildAcToken, buildConditionTokens, buildHealthStatusToken, buildHealthToken, buildThpToken } from "./TokenCreators";

export default reactive({
	combatantCache: {} as Record<string, CombatantData>,

	async updateCombatants() {
		const response = await fetch(`/api/getInit/${room.channelID}`);
		const combatants: Record<string, CombatantData> = await response.json();

		const sceneDpi = await OBR.scene.grid.getDpi();
		console.log("Requested to update");
		const currentAttachments = await OBR.scene.items.getItems<Shape>((item) => {
			const metadata = item.metadata[getPluginId("metadata")];
			return Boolean(isPlainObject(metadata));
		});

		const items = await OBR.scene.items.getItems(
			(item): item is Image => item.layer === "CHARACTER" && isImage(item)
		);

		const toAdd: Item[] = [];
		const toDelete: string[] = [];

		const updateAC = async (item: Image, boundingBox: BoundingBox, combatant: CombatantData, dpiScale: number) => {
			console.log("Updating AC...");
			const currentAc = currentAttachments.filter((a) => {
				const metadata = a.metadata[getPluginId("metadata")];
				return Boolean(isPlainObject(metadata) && metadata.isAc && a.attachedTo === item.id);
			});

			if (combatant.ac !== undefined)
				toAdd.push(...await buildAcToken(item, boundingBox, combatant.ac, dpiScale));

			toDelete.push(...currentAc.map(a => a.id));
		};

		const updateHealth = async (item: Image, boundingBox: BoundingBox, combatant: CombatantData, dpiScale: number) => {
			console.log("Updating health");
			const currentHealth = currentAttachments.filter((a) => {
				const metadata = a.metadata[getPluginId("metadata")];
				return Boolean(isPlainObject(metadata) && metadata.isHealth && a.attachedTo === item.id);
			});

			if (combatant.hp !== undefined || combatant.maxHp !== undefined) {
				toAdd.push(...await buildHealthToken(item, boundingBox, [combatant.hp || 0, combatant.maxHp || 0], dpiScale));
				toDelete.push(...currentHealth.map(a => a.id));
			}

			if (this.combatantCache[combatant.name]?.hp && !combatant.hp || this.combatantCache[combatant.name]?.maxHp && !combatant.maxHp) {
				toDelete.push(...currentHealth.map(a => a.id));
			}
		};

		const updateThp = async (item: Image, boundingBox: BoundingBox, combatant: CombatantData, dpiScale: number) => {
			console.log("Updating thp");
			console.log(combatant);
			const currentThp = currentAttachments.filter((a) => {
				const metadata = a.metadata[getPluginId("metadata")];
				return Boolean(isPlainObject(metadata) && metadata.isThp && a.attachedTo === item.id);
			});

			if (combatant.thp !== undefined) {
				toDelete.push(...currentThp.map(a => a.id));
				toAdd.push(...await buildThpToken(item, boundingBox, combatant.thp, dpiScale));
			}

			if (this.combatantCache[combatant.name]?.thp && !combatant.thp) {
				toDelete.push(...currentThp.map(a => a.id));
			}
		};

		const updateHealthStatus = async (item: Image, boundingBox: BoundingBox, combatant: CombatantData, dpiScale: number) => {
			console.log("Updating Health Status");
			const currentHealthStatuses = currentAttachments.filter((a) => {
				const metadata = a.metadata[getPluginId("metadata")];
				return Boolean(isPlainObject(metadata) && metadata.isHealthStatus && a.attachedTo === item.id);
			});

			if (combatant.hpStatus !== undefined) {
				toAdd.push(...await buildHealthStatusToken(item, boundingBox, combatant.hpStatus, dpiScale));
				toDelete.push(...currentHealthStatuses.map(a => a.id));
			}

			if (this.combatantCache[combatant.name]?.hpStatus && !combatant.hpStatus) {
				toDelete.push(...currentHealthStatuses.map(a => a.id));
			}
		};

		const updateConditions = async (item: Image, boundingBox: BoundingBox, combatant: CombatantData) => {
			console.log("Updating Conditions Status");
			const currentConditions = currentAttachments.filter((a) => {
				const metadata = a.metadata[getPluginId("metadata")];
				return Boolean(isPlainObject(metadata) && metadata.isCondition && a.attachedTo === item.id);
			});

			if (combatant.conditions !== undefined) {
				toAdd.push(...await buildConditionTokens(item, boundingBox, combatant.conditions || ""));
				toDelete.push(...currentConditions.map(a => a.id));
			}

			if (this.combatantCache[combatant.name]?.conditions && !combatant.conditions) {
				toDelete.push(...currentConditions.map(a => a.id));
			}
		};

		for (const combatantName in combatants) {
			const combatant = combatants[combatantName];
			for (const item of items) {
				if (item.text.plainText.toLowerCase().replaceAll(" ", "") === combatantName.toLowerCase().replaceAll(" ", "")) {
					const dpiScale = sceneDpi / (item.grid.dpi);
					const boundingBox = await OBR.scene.items.getItemBounds([item.id]);

					if (combatant.ac !== this.combatantCache[combatantName]?.ac)
						await updateAC(item, boundingBox, combatant, dpiScale);
					if (combatant.hp !== this.combatantCache[combatantName]?.hp || combatant.maxHp !== this.combatantCache[combatantName]?.maxHp)
						await updateHealth(item, boundingBox, combatant, dpiScale);
					if (combatant.thp !== this.combatantCache[combatantName]?.thp)
						await updateThp(item, boundingBox, combatant, dpiScale);
					if (combatant.hpStatus !== this.combatantCache[combatantName]?.hpStatus)
						await updateHealthStatus(item, boundingBox, combatant, dpiScale);
					if (combatant.conditions !== this.combatantCache[combatantName]?.conditions)
						await updateConditions(item, boundingBox, combatant);
				}
			}
		}

		if (toAdd.length > 0) {
			await OBR.scene.items.addItems(toAdd);
		}

		if (toDelete.length > 0) {
			await OBR.scene.items.deleteItems(toDelete);
		}

		this.combatantCache = combatants;
	},
	forceUpdate() {
		this.combatantCache = {};
		this.updateCombatants();
	},
	async clear() {
		const currentAttachments = await OBR.scene.items.getItems<Shape>((item) => {
			const metadata = item.metadata[getPluginId("metadata")];
			return Boolean(isPlainObject(metadata));
		});
		await OBR.scene.items.deleteItems(currentAttachments.map(a => a.id));
	},
	runEffects() {
		room.lastUpdateMs = Date.now();

		this.updateCombatants();
	}
});
