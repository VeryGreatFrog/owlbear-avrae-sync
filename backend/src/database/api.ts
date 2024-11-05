import type { Request, Response } from "express";
import { app } from "../app/app.js";
import { broadcastInit } from "../app/socket.js";
import { collections, trackedMessageCache } from "./database.js";

export interface initData {
	channelId: string;
	messageId: string;
	content: string;
	lastUpdated: number;
}

export async function insertInit(channelId: string, messageId: string, newContent: string) {
	const data = { channelId, content: newContent, messageId, lastUpdated: Date.now() };
	try {
		if (!data.channelId)
			return null;
		if (trackedMessageCache.includes(messageId)) {
			console.log("database", `Updating initiative with id ${channelId}`);
			await collections.activeInits?.updateOne({ channelId }, { $set: { content: newContent } });
		}
		else {
			console.log("database", "Adding new initiative to collection");
			await collections.activeInits?.insertOne(data);
			trackedMessageCache.push(messageId);
		}
		broadcastInit(channelId);
	}
	catch (err) {
		console.log("critical", err);
		return null;
	}
}

interface CombatantData {
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
	isCurrentTurn?: boolean;
}

const getCombatants = (list: string): Record<string, CombatantData> => {
	const byLine = list.split("\n");
	const combatantData: Record<string, CombatantData> = {};

	let isGroupTurn = false;
	for (let possibleCombatant of byLine) {
		possibleCombatant = possibleCombatant.trimStart();
		// All real combatants include <4/10> or <Healthy> or <None>. Names of group do not have it. It is possible to name a group with a < in it but that aside for now.
		// This means that these are groups
		if (!possibleCombatant.includes("<")) {
			// It is the current group's turn
			if (possibleCombatant.startsWith("#")) {
				isGroupTurn = true;
			}
			continue;
		}

		// We were in a group, but now no longer.
		if (isGroupTurn && !possibleCombatant.startsWith("-")) {
			isGroupTurn = false;
		}
		// Otherwise, they are real combatants.
		const combatant = possibleCombatant;

		let hpStatus;
		let hp;
		let thp;
		let maxHp;
		let ac;
		let conditions;
		const isCurrentTurn = (isGroupTurn || combatant.startsWith("#")) || undefined;

		const nameMatch = combatant.match(/^#*\s*(?:\d+:\s*)?([^\s<]+(?:\s[^\s<]+)*)/);
		let name = "";
		if (nameMatch && nameMatch.length >= 2)
			name = nameMatch[1].replace("- ", "");

		let health = "";
		const healthMatch = combatant.match(/<([^<>]+)>/);
		if (healthMatch && healthMatch.length >= 2)
			health = healthMatch[1];

		if (health.includes("HP")) {
			if (health.includes("temp")) {
				const [current, temp] = health.replace("HP", "").replace("temp", "").split(",");

				hp = Number.parseInt(current.split("/")[0]) || 0;
				maxHp = Number.parseInt(current.split("/")[1]) || 0;
				thp = Number.parseInt(temp);
			}
			else {
				const current = health.replace("HP", "").replace("temp", "");
				hp = Number.parseInt(current.split("/")[0]) || 0;
				maxHp = Number.parseInt(current.split("/")[1]) || 0;
			}
		}
		else if (health.includes("None")) {
			hpStatus = "None";
		}
		else {
			hpStatus = health;
		}

		const acMatch = combatant.match(/AC\s+(\d+)/);
		if (acMatch && acMatch.length >= 2) {
			ac = Number.parseInt(acMatch[1]);
		}

		let conditionMatch = null;
		if (acMatch) {
			conditionMatch = combatant.replace(`AC ${ac},`, "").match(/\((.*?)\)/);
		}
		else {
			conditionMatch = combatant.match(/\((.*?)\)/);
		}

		if (conditionMatch) {
			conditions = conditionMatch[1].toLowerCase();
			if (conditions.includes("(hypnotic pattern")) {
				conditions += "incapacitated";
			}
		}
		combatantData[name] = {
			name,
			hpStatus,
			hp,
			maxHp,
			thp,
			ac,
			conditions,
			isCurrentTurn
		};
	}
	console.log(combatantData);
	return combatantData;
};

// @ts-expect-error Shut up
app.get("/api/getInit/:id", async (req: Request, res: Response) => {
	try {
		const data = await collections.activeInits?.findOne({ channelId: req.params.id });
		if (!data)
			return res.json({ error: "No initiative for that channel found" });
		const list = data.content.split("===============================")[1];

		return res.json(getCombatants(list));
	}
	catch (e) {
		console.log(e);
		return res.status(500).json({ error: "Unknown server error occured, please try again." });
	}
});
