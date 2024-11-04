<script setup lang="ts">
import { ref } from "vue";
import room from "../managers/ChannelConnection";

const isEditing = ref(false);
const changeSceneId = async (v: string) => {
	room.setChannel(v);
};
</script>

<template>
	<div class="inputs">
		<input type="text" placeholder="Channel ID" :value="room.channelID" @focus="isEditing = true" @change="(v : Event) => changeSceneId((v.target as HTMLInputElement).value || '0')" @blur="isEditing = false">
	</div>
</template>

<style scoped>
.inputs {
    display: flex;
    margin: auto;
    justify-content: center;
	width: 50%;

	input {
		width: 100%;
	}
    .check {
        cursor: pointer;
        svg {
            display: flex;
        }
        path {
            fill: rgba(255, 255, 255, 0.87)
        }
    }
}
</style>
