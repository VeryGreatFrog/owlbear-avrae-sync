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

const getData = (combatant: string): CombatantData => {
	let isPlayer = false;
	let isMonster = false;
	let isGenericCombatant = false;
	let hpStatus;
	let hp;
	let thp;
	let maxHp;
	let ac;
	let conditions;

	const nameMatch = combatant.match(/^#*\s*(?:\d+:\s*)?([^\s<]+(?:\s[^\s<]+)*)/);
	let name = "";
	if (nameMatch && nameMatch.length >= 2)
		name = nameMatch[1].replace(" -", "");

	let health = "";
	const healthMatch = combatant.match(/<([^<>]+)>/);
	if (healthMatch && healthMatch.length >= 2)
		health = healthMatch[1];

	if (health.includes("HP")) {
		isPlayer = true;
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
		isGenericCombatant = true;
		hpStatus = "None";
	}
	else {
		isMonster = true;
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
	return {
		name,
		isPlayer,
		isMonster,
		isGenericCombatant,
		hpStatus,
		hp,
		maxHp,
		thp,
		ac,
		conditions
	};
};

const extractCombatants = /(.*)(?=\n(?!\s*-\s)|$)|(?<=-\s)(.*)(?=\n|$)/g;
// @ts-expect-error Shut up
app.get("/api/getInit/:id", async (req: Request, res: Response) => {
	try {
		const data = await collections.activeInits?.findOne({ channelId: req.params.id });
		if (!data)
			return res.json({ error: "No initiative for that channel found" });
		const list = data.content.split("===============================")[1];
		const matches = list.match(extractCombatants)?.filter(v => v);
		const returnData: Record<string, CombatantData> = {};
		for (const match of matches || []) {
			const d = getData(match);
			returnData[d.name] = d;
			console.log(d);
		}

		return res.json(returnData);
	}
	catch (e) {
		console.log(e);
		return res.status(500).json({ error: "Unknown server error occured, please try again." });
	}
});
