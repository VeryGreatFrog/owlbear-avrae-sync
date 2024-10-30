import { SlashCommandBuilder } from "discord.js";
export default {
    data: new SlashCommandBuilder()
        .setName("unwatch")
        .setDescription("Stop watching init in this channel."),
    async execute(interaction) {
        await interaction.reply("Watching for changes in this channel!");
    },
};
