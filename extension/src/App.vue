<script setup lang="ts">
import ChannelSelector from "./components/ChannelSelector.vue";
import room from "./managers/ChannelConnection";
import tokenManager from "./managers/TokenManager";
</script>

<template>
	<section class="container">
		<div class="header">
			<h1> Draconic Watch </h1>
		</div>
		<div class="channel">
			<ChannelSelector />
		</div>
		<div class="buttons">
			<h2> Sync Buttons </h2>
			<button type="button" @click="tokenManager.forceUpdate()">
				Force a resync
			</button>
			<button type="button" @click="tokenManager.clear()">
				Clear
			</button>
			<button type="button" @click="tokenManager.clear(true)">
				Clear & Stop
			</button>
		</div>
		<div v-if="room.lastUpdateMs" class="status">
			<h2> Status </h2>
			Received last update: {{ new Date(room.lastUpdateMs).toLocaleString() }}
		</div>
	</section>
</template>

<style scoped>
.header {
	h1 {
		font-size: 1.5rem;
		padding-bottom: .5rem;
	}

	background: rgb(83,83,131);
	background: linear-gradient(180deg, rgb(25, 25, 52) 0%, rgb(25, 25, 52) 60%, rgba(36,36,36,1) 100%);
	margin-bottom: .5rem;
}



.buttons {
	display: grid;
	gap: 1rem 0;
	width: 	50%;
	margin: auto;
	h2 {
		margin-block: 1.5rem 0;
	}
}
</style>
