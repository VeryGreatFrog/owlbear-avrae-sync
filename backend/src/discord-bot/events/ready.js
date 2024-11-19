import { insertInit } from "../../../src/database/api.js";
import { trackedMessageCache } from "../../../src/database/database.js";
import { ChannelType, Events } from "discord.js";
const removeEmptyKeys = (obj) => {
    for (const key in obj) {
        if (Object.keys(obj[key]).length === 0) {
            delete obj[key];
        }
    }
};
let getChannels;
let startWatching;
export { getChannels, startWatching };
export default {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        console.log(`Ready! Logged in as ${client.user?.tag}`);
        getChannels = async function getAllChannels(guildId) {
            // Fetch the guild by ID
            const guild = await client.guilds.fetch(guildId);
            if (!guild) {
                throw new Error(`Guild with ID ${guildId} not found`);
            }
            // Fetch all channels in the guild
            const channels = await guild.channels.fetch();
            const result = {};
            // Helper function to add a channel to the result object
            const addChannelToCategory = (category, channelName, channelId) => {
                if (!result[category]) {
                    result[category] = {};
                }
                result[category][channelId] = channelName;
            };
            for (const channel of channels.values()) {
                if (!channel)
                    continue;
                // Determine the parent category
                const parentCategory = channel.parent ? channel.parent.name : "No Category";
                // Handle categories
                if (channel.type === ChannelType.GuildCategory) {
                    if (!result[channel.name]) {
                        result[channel.name] = {};
                    }
                    continue;
                }
                // Handle text channels, voice channels, and forum channels
                if (channel.type === ChannelType.GuildText
                    || channel.type === ChannelType.GuildForum) {
                    addChannelToCategory(parentCategory, channel.name, channel.id);
                    const activeThreads = await channel.threads.fetchActive();
                    // Add active threads
                    activeThreads.threads.forEach(thread => addChannelToCategory(parentCategory, `${channel.name} -> ${thread.name}`, thread.id));
                }
            }
            removeEmptyKeys(result);
            return {
                metadata: {
                    guildName: guild.name
                },
                channels: result
            };
        };
        startWatching = async (channelId) => {
            const channel = await client.channels.fetch(channelId);
            if (!channel)
                return;
            if (channel.type === ChannelType.GuildCategory)
                return;
            const pinnedMessages = await channel.messages.fetchPinned() || [];
            let initPost = null;
            for (const x of pinnedMessages) {
                const data = x[1];
                if (data.author.id === "261302296103747584") {
                    initPost = data;
                }
            }
            if (!initPost?.id)
                return;
            if (trackedMessageCache.includes(initPost?.id))
                return;
            insertInit(channelId, initPost?.id, initPost?.content);
        };
    },
};
