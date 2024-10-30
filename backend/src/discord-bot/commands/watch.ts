import type { ChatInputCommandInteraction } from "discord.js";
import { insertInit } from "@/src/database/api.js";
import { SlashCommandBuilder } from "discord.js";
import { trackedMessageCache } from "../../database/database.js";

export default {
	data: new SlashCommandBuilder()
		.setName("watch")
		.setDescription("Start watching init in this channel!"),
	async execute(interaction: ChatInputCommandInteraction) {
		const id = interaction.channel?.id;
		if (!id) {
			await interaction.reply("Not a valid channel to watch initiative..");
			return;
		}

		const messages = await interaction.channel?.messages.fetchPinned() || [];
		let initPost = null;

		for (const x of messages) {
			const data = x[1];
			if (data.author.id === "261302296103747584") {
				initPost = data;
			}
		}

		if (!initPost?.id) {
			await interaction.reply("Could not find a pinned avrae init post.");
			return;
		}

		if (trackedMessageCache.includes(initPost?.id)) {
			await interaction.reply("Avrae Init is already being tracked in this channel.");
			return;
		}

		insertInit(id, initPost?.id, initPost?.content,);
		await interaction.reply("Now watching for changes in this channel!");
	},
};
