import http from "node:http";
import dotenv from "dotenv";
import { app } from "./src/app/app";
import { initSocket } from "./src/app/socket";
import { startDatabase } from "./src/database/database";
import discord from "./src/discord-bot/client";
// Load middleware
import "./src/app/middleware";
// load env files
dotenv.config();
// connect to mongodb database
startDatabase();
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
