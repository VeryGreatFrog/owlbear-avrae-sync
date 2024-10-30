import { insertInit } from "@/src/database/api";
import { trackedMessageCache } from "@/src/database/database";
import { Events } from "discord.js";
export default {
    name: Events.MessageUpdate,
    execute(oldMessage, newMessage) {
        console.log("got an update");
        // Partial if the message was made before the bot started
        if (newMessage.partial) {
            newMessage.fetch()
                .then((fullMessage) => {
                if (trackedMessageCache.includes(fullMessage.id)) {
                    insertInit(fullMessage.channel.id, fullMessage.id, fullMessage.content);
                }
            })
                .catch((error) => {
                console.log("Something went wrong when fetching the message: ", error);
            });
        }
        else {
            if (trackedMessageCache.includes(newMessage.id)) {
                newMessage.fetch()
                    .then((fullMessage) => {
                    if (trackedMessageCache.includes(fullMessage.id)) {
                        insertInit(fullMessage.channel.id, fullMessage.id, fullMessage.content);
                    }
                })
                    .catch((error) => {
                    console.log("Something went wrong when fetching the message: ", error);
                });
            }
        }
    }
};
