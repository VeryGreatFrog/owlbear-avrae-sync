import type { ChatInputCommandInteraction } from "discord.js";
import { SlashCommandBuilder } from "discord.js";
import { collections, trackedMessageCache } from "../../database/database";

export default {
	data: new SlashCommandBuilder()
		.setName("unwatch")
		.setDescription("Stop watching init in this channel."),
	async execute(interaction: ChatInputCommandInteraction) {
		const id = interaction.channel?.id;
		await interaction.reply("Unwatching this channel!");

		const messages = await interaction.channel?.messages.fetchPinned() || [];
		let initPostId = null;

		for (const x of messages) {
			const data = x[1];
			if (data.author.id === "261302296103747584") {
				initPostId = data.id;
			}
		}

		if (initPostId) {
			try {
				await collections.activeInits?.deleteOne({ channelId: id });
				trackedMessageCache.splice(trackedMessageCache.indexOf(initPostId));
			}
			catch {}
		}
	},
};
