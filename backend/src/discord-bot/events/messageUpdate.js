import { getIO } from "../../../src/app/socket.js";
import { insertInit } from "../../../src/database/api.js";
import { collections, trackedMessageCache } from "../../../src/database/database.js";
import { Events } from "discord.js";
export default {
    name: Events.MessageUpdate,
    execute(oldMessage, newMessage) {
        console.log("got an update");
        newMessage.fetch()
            .then(async (fullMessage) => {
            // Avrae message
            if (fullMessage.author.id === "261302296103747584") {
                console.log("A message which we care about..");
                const ID = fullMessage.id;
                // Not yet tracking this init post. Combat started.
                if (!trackedMessageCache.includes(ID) && fullMessage.pinned) {
                    await insertInit(fullMessage.channel.id, ID, fullMessage.guildId || "", fullMessage.content);
                    trackedMessageCache.push(ID);
                    getIO().emit("updateGuild", fullMessage.guildId);
                }
                // we were tracking this message, but it got unpinned. Combat ended.
                else if (trackedMessageCache.includes(ID) && !fullMessage.pinned) {
                    await collections.activeInits?.deleteOne({ channelId: fullMessage.channelId });
                    trackedMessageCache.splice(trackedMessageCache.indexOf(ID));
                    // broadcast that people listening to this guild should refetch.
                    getIO().emit("updateGuild", fullMessage.guildId);
                }
                // We were tracking this message. Update init.
                else if (trackedMessageCache.includes(ID)) {
                    insertInit(fullMessage.channel.id, ID, fullMessage.guildId || "", fullMessage.content);
                }
            }
        })
            .catch((error) => {
            console.log("Something went wrong when fetching the message: ", error);
        });
    }
};
