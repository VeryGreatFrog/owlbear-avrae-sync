import type { GuildTextBasedChannel, Message } from "discord.js";
import { getIO } from "@/src/app/socket.js";
import { insertInit, updateInit } from "@/src/database/api.js";

import { collections, trackedMessageCache } from "@/src/database/database.js";
import { ChannelType, Events } from "discord.js";

export default {
	name: Events.MessageUpdate,
	execute(oldMessage: Message, newMessage: Message) {
		newMessage.fetch()
			.then(async (fullMessage) => {
				// Avrae message
				if (fullMessage.author.id === "261302296103747584") {
					const ID = fullMessage.id;
					// Not yet tracking this init post. Combat started.
					if (!trackedMessageCache.has(ID) && fullMessage.pinned) {
						const channel = fullMessage.channel as GuildTextBasedChannel;
						let channelName = `${channel.name}`;
						let categoryName = "";
						if (channel.type === ChannelType.PublicThread || channel.type === ChannelType.PrivateThread) {
							channelName = `#${channel?.parent?.name} 🡆 #${channel.name}`;
							categoryName = channel?.parent?.parent?.name || "";
						}
						else {
							channelName = `#${channel.name}`;
							categoryName = channel.parent?.name || "";
						}
						console.log("started for ", channelName, categoryName);
						await insertInit(channel.id, channelName, categoryName, fullMessage?.id, channel.guildId || "", fullMessage?.content,);
						getIO().emit("updateGuild", fullMessage.guildId);
					}
					// we were tracking this message, but it got unpinned. Combat ended.
					else if (trackedMessageCache.has(ID) && !fullMessage.pinned) {
						await collections.activeInits?.deleteMany({ channelId: fullMessage.channelId });
						trackedMessageCache.delete(ID);

						// broadcast that people listening to this guild should refetch.
						getIO().emit("updateGuild", fullMessage.guildId);
					}
					// We were tracking this message. Update init.
					else if (trackedMessageCache.has(ID)) {
						const channel = fullMessage.channel as GuildTextBasedChannel;
						await updateInit(channel.id, fullMessage?.content,);
					}
				}
			})
			.catch((error) => {
				console.log("Something went wrong when fetching the message: ", error);
			});
	}

};
