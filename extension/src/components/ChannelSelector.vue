<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import room from "../managers/ChannelConnection";
import { socket } from "../socket";
import OBR from "@owlbear-rodeo/sdk";

const guildId = ref(room.guildId);
onMounted(() => {
	guildId.value = room.guildId
})
const isLoadingGuild = ref(true)

const isEditingGuild = ref(false);
const guildData = ref<Response["data"] | null>();

const updateGuild = async (shouldSet = true, shouldLoad = true) => {
	if (shouldLoad) isLoadingGuild.value = true
	isEditingGuild.value = false
	if (shouldSet) await room.setGuild(guildId.value, true);


	if (room.guildId !== "")  {
	socket.emit("getChannels", room.guildId, async (response: Response) => {
		if (response.data) {
			guildData.value = response.data;

			if (!guildData.value || !guildData.value.channels) return
			const combinedObject = Object.values(guildData.value.channels).reduce((acc, child) => {
				return { ...acc, ...child };
			}, {});

			if (!Object.keys(combinedObject).includes(room.channelId)) {
				await room.setChannel("", true)
			}
		}
		else {
			guildData.value = null;
			//OBR.notification.show("Could not retrieve this server", "WARNING")
		}
		if (shouldLoad) isLoadingGuild.value = false
	}) 
	} else {
		guildData.value = null
		isLoadingGuild.value = false
	}
}
watch(() => guildId.value, () => {
	updateGuild()
});
updateGuild(false)

interface Response {
	status: "ok" | "error";
	error?: any;
	data: {
		metadata: {
			guildName: string;
		};
		channels: Record<string, Record<string, string>>;
	};
}

const channelName = computed(() => {
	if (!guildData?.value?.channels) return "No valid channel"
	const combinedObject = Object.values(guildData.value.channels).reduce((acc, child) => {
		return { ...acc, ...child };
	}, {});

	return combinedObject[room.channelId]
})

const isEditingChannel = ref(false)
const channelId = ref(room.channelId)
watch(() => channelId.value, async () => {
	await room.setChannel(channelId.value, true)
	isEditingChannel.value = false;

})

watch(() => isEditingGuild.value, () => {
	if (isEditingGuild.value) {
		isEditingChannel.value = false
	}
})


socket.on("updateGuild", async (serverId) => {
	if (serverId === room.guildId) {
		await updateGuild(false, false)
	}
})

isLoadingGuild.value = false
</script>

<template>
	<div class="table" v-if="!isLoadingGuild">
		<div class="guild">
			<b>
				{{ isEditingGuild ? 'Choose server' : 'Server' }}
				<svg v-if="!isEditingGuild" @click="isEditingGuild = true" xmlns="http://www.w3.org/2000/svg" width="32"
					height="32" viewBox="0 0 20 20">
					<path fill="#888888"
						d="m16.77 8l1.94-2a1 1 0 0 0 0-1.41l-3.34-3.3a1 1 0 0 0-1.41 0L12 3.23zM1 14.25V19h4.75l9.96-9.96l-4.75-4.75z" />
				</svg>
			</b>
			<div class="input">
				<template v-if="!isEditingGuild">
					<span v-if="guildData?.metadata.guildName">
						Linked to <u> {{ guildData.metadata.guildName }}</u>
					</span>
					<span v-else-if="room.guildId === ''">
						Not linked to a server.
					</span>
					<span v-else>
						Server ID ({{ room.guildId }}) not valid.
					</span>
				</template>
				<template v-else>
					<span>Enter a server ID</span>
					<div class="check-wrapper">
						<input v-if="isEditingGuild" v-model.lazy="guildId" type="text" placeholder="Guild ID"
						pattern="\d{16,}" title="Enter a valid guild ID" @blur="isEditingGuild = false">
						<svg @click="updateGuild()" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 20 20"><path fill="#888888" d="M7 14.2L2.8 10l-1.4 1.4L7 17L19 5l-1.4-1.4z"/></svg>
					</div>
				</template>
			</div>
		</div>
		<div class="channel" v-if="guildData?.channels">
			<b> {{ isEditingChannel ? 'Choose channel' : 'Channel' }}
				<svg v-if="!isEditingChannel" @click="isEditingChannel = true" xmlns="http://www.w3.org/2000/svg"
					width="32" height="32" viewBox="0 0 20 20">
					<path fill="#888888"
						d="m16.77 8l1.94-2a1 1 0 0 0 0-1.41l-3.34-3.3a1 1 0 0 0-1.41 0L12 3.23zM1 14.25V19h4.75l9.96-9.96l-4.75-4.75z" />
				</svg>
			</b>
			<div class="input">
				<template v-if="!isEditingChannel">
					<span v-if="channelName">
						Linked to <u>#{{ channelName }}</u>
					</span>
					<span v-else @click="isEditingChannel = true">
						Select a valid channel
					</span>
				</template>
				<template v-else>
					<select v-if="guildData" v-model.lazy="channelId" placeholder="Select channel.."
						@blur="isEditingChannel = false">
						<option v-if="Object.keys(guildData.channels).length === 0" disabled value="d"> No channels found in this server. Have you started Avrae Initiative?</option>
						<option v-else value=""> --- No Channel --- </option>
						<optgroup v-for="catChannels, cat of guildData.channels" :key="cat" :label="cat.toLowerCase()">
							<option v-for="channelName, channelId in catChannels" :key="channelId" :value="channelId">
								{{ channelName }}
							</option>
						</optgroup>
					</select>
				</template>
			</div>
		</div>
		<div v-else>
			<b> Channel</b>
			<div class="input">
				First select a valid server
			</div>
		</div>
	</div>
	<div class="loading" v-else>
		Loading...
	</div>
</template>

<style scoped>
.table {
	display: grid;
	grid-template-columns: 1fr 1fr;
	margin-inline: 1rem;
	gap: .2rem;

	.guild, .channel {
		max-width: 1fr;
	}

	.check-wrapper {
		display: flex;
	}


	svg {
		cursor: pointer;
		padding-inline: .2rem;
		display: inline-flex;
		font-size: medium;
		height: 14px;
		width: 14px;
		margin: auto;
		translate: 0 2px;
		color: white;

		path {
			fill: white
		}
	}

	.input {
		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: 1fr;
		select {
			margin-top: .2rem;
			width: 100%;
		}
	}

	b {
		font-size: 1.15rem
	}

	input:invalid {
		border: 1px solid red
	}
}

.loading {
	margin: auto;
}
</style>
