import { collections, } from "../../../src/database/database.js";
import { Events } from "discord.js";
const removeEmptyKeys = (obj) => {
    for (const key in obj) {
        if (Object.keys(obj[key]).length === 0) {
            delete obj[key];
        }
    }
};
let getChannels;
let isMessagePinned;
export { getChannels, isMessagePinned };
export default {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        getChannels = async (guildId) => {
            console.log("Getting data for ", guildId);
            // Fetch the guild by ID
            const guild = client.guilds.cache.get(guildId);
            if (!guild) {
                throw new Error(`Guild with ID ${guildId} not found`);
            }
            const trackedChannels = ((await collections?.activeInits?.find({ guildId, channelName: { $exists: true, $ne: "" } }, { projection: { _id: 0, channelId: 1, categoryName: 1, channelName: 1 } }).toArray()) || []);
            const result = transformData(trackedChannels);
            removeEmptyKeys(result);
            return {
                metadata: {
                    guildName: guild.name
                },
                channels: result
            };
        };
        isMessagePinned = async (channelId, messageId) => {
            try {
                // Fetch the channel
                const channel = await client.channels.fetch(channelId);
                if (!channel || !channel.isTextBased()) {
                    console.log(`Channel ${channelId} is not valid or not text-based.`);
                    return false;
                }
                // Fetch the message
                const message = await channel.messages.fetch(messageId);
                // Return the pinned status
                return message.pinned;
            }
            catch {
                return false;
            }
        };
    },
};
function transformData(data) {
    return data.reduce((result, item) => {
        const { categoryName, channelId, channelName } = item;
        // Initialize the category if it doesn't exist
        if (!result[categoryName]) {
            result[categoryName] = {};
        }
        // Add channelId and channelName to the category object
        result[categoryName][channelId] = channelName;
        return result;
    }, {});
}
