import OBR from "@owlbear-rodeo/sdk";
import { createApp } from "vue";

import App from "./App.vue";
import room from "./managers/ChannelConnection.ts";
import "./style.css";
import "./socket.ts";

OBR.onReady(() => {
	createApp(App).mount("#app");

	room.init();
});
