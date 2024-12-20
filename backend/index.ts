import type { NextFunction, Request, Response, } from "express";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import dotenv from "dotenv";
import express from "express";
import { app } from "./src/app/app.js";

import { initSocket } from "./src/app/socket.js";

import { loadMessageCache, startDatabase } from "./src/database/database.js";
// this must come first
import client from "./src/discord-bot/client.js";

// Load middleware
import "./src/app/middleware.js";

// Run deploy commands
import "./src/discord-bot/deploy-commands.js";

// load env files
dotenv.config();

// connect to mongodb database
await startDatabase();

// Server extension frontend
app.set("trust proxy", "loopback");
app.use("/", express.static(path.resolve(process.env.frontendPath ?? "../extension")));
app.get("/*", (req, res) => {
	res.send(fs.readFileSync(path.resolve(process.env.frontendPath ?? "../extension", "index.html"), { encoding: "utf-8" }));
});

// create server and listen to ports
export const httpServer = http.createServer(app);
httpServer.listen(Number.parseInt(process.env.PORT ?? "3000"), () => {
	console.info(`API: Server listening to port ${process.env.PORT ?? "3000"}`);
});

initSocket(httpServer);
// log in with discord
await client.login(process.env.DISCORD_BOT_TOKEN!).catch(() => console.error("Failed to connect to discord bot"));
console.log(`Ready! Logged in as ${client.user?.tag}`);

// now load our message cache after the discord bot starts
await loadMessageCache();
// Instantiate all other routes as bad
// @ts-expect-error Idk whats wrong
app.get("/api/*", (_err: Error, _req: Request, res: Response, _next: NextFunction) => res.status(404).json({ error: "Path not found." }));
// @ts-expect-error Idk whats wrong
app.get("/*", (_err: Error, _req: Request, res: Response, _next: NextFunction) => res.status(404).json({ error: "Path not found." }));

console.log("\x1B[32m%s\x1B[0m", "APP: Fully initialized.");
