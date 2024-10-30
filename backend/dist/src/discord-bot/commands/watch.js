import { SlashCommandBuilder } from "discord.js";
export default {
    data: new SlashCommandBuilder()
        .setName("watch")
        .setDescription("Start watching init in this channel!"),
    async execute(interaction) {
        await interaction.reply("Watching for changes in this channel!");
        const id = await interaction.channel?.id;
        console.log(id);
        let initPost = null;
        // sync every 10 seconds
        setInterval(async () => {
            const messages = await interaction.channel?.messages.fetchPinned() || [];
            for (const x of messages) {
                const data = x[1];
                if (data.author.id === "261302296103747584") {
                    initPost = data;
                    console.log(initPost.content);
                    await fetch(`http://localhost:3000/api/updateInit/${id}`, {
                        method: "POST",
                        body: JSON.stringify({ data: data.content }),
                        headers: {
                            "Content-Type": "application/json",
                        },
                    });
                    console.log("Request was made");
                    break;
                }
            }
        }, 5000);
    },
};
