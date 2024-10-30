import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import dotenv from "dotenv";
import express from "express";
import { app } from "./src/app/app.js";
import { initSocket } from "./src/app/socket.js";
import { startDatabase } from "./src/database/database.js";
import discord from "./src/discord-bot/client.js";
// Load middleware
import "./src/app/middleware.js";
// Run deploy commands
import "./src/discord-bot/deploy-commands.js";
// load env files
dotenv.config();
// connect to mongodb database
startDatabase();
// Server extension frontend
app.use(express.static(process.env.frontendPath ?? "../extension"));
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
discord.login(process.env.DISCORD_BOT_TOKEN).catch(() => console.error("Failed to connect to discord bot"));
// Instantiate all other routes as bad
// @ts-expect-error Idk whats wrong
app.get("/api/*", (_err, _req, res, _next) => res.status(404).json({ error: "Path not found." }));
// @ts-expect-error Idk whats wrong
app.get("/*", (_err, _req, res, _next) => res.status(404).json({ error: "Path not found." }));
