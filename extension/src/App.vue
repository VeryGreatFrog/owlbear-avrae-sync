<script setup lang="ts">
import ChannelSelector from "./components/ChannelSelector.vue";
import room from "./managers/ChannelConnection";
import tokenManager from "./managers/TokenManager";
</script>

<template>
	<section class="container">
		<div class="header">
			<h1> Owlbear Avrae Sync </h1>
		</div>
		<div class="channel">
			<h2> Room Options </h2>
			<ChannelSelector />
			Received last update: {{ new Date(room.lastUpdateMs).toLocaleString() }}
		</div>
		<div class="buttons">
			<h2> Sync Buttons </h2>
			<button type="button" @click="tokenManager.forceUpdate()">
				Force a resync
			</button>
			<button type="button" @click="tokenManager.clear()">
				Stop tracking
			</button>
		</div>
	</section>
</template>

<style scoped>
	h2 {
		border-bottom: 2px solid;
	}
</style>
