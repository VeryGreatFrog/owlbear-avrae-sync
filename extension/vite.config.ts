import vue from "@vitejs/plugin-vue";

export default {
	root: ".",
	plugins: [
		vue(),
	],
	build: {
		outDir: "../build/extension",
		emptyOutDir: true,
	},
	server: {
		proxy: {
			"/api": "http://localhost:3000"
		}
	}
};
