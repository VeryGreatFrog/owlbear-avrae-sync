import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { app } from "./app.js";
// Function to run on all requests
app.use(async (req, res, next) => {
    console.log(`API: Request for URL "${req.url}" recieved.`);
    // Set Permissions Policy
    res.setHeader("Permissions-Policy", "fullscreen=('self'), accelerometer=(), autoplay=(), camera=(), geolocation=('self'), gyroscope=(), interest-cohort=(), magnetometer=(), microphone=(), payment=(), sync-xhr=()");
    next();
});
// Body parsing
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());
// Security stuff
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            "default-src": ["'self'"],
            "img-src": ["https://cdn.discordapp.com", "*", "'self'", "data: 'self'"],
            "script-src": ["'self'", "'sha256-reBsRZd5I88opZSwT59Ir+QlBhrEhdRJ1aQUr4GXhyw='", "https://www.googletagmanager.com", "https://cdn.jsdelivr.net"],
            "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdn.jsdelivr.net"],
            "font-src": ["'self'", "data: https://fonts.gstatic.com", "https://cdn.jsdelivr.net"],
            "connect-src": ["'self'", "https://discord.com", "*.google-analytics.com", "https://cdn.jsdelivr.net"],
            "worker-src": ["'self'", "blob:"],
        },
        useDefaults: true
    },
    crossOriginResourcePolicy: {
        policy: "cross-origin"
    }
}));
app.disable("x-powered-by");
app.use(rateLimit({
    windowMs: 1000, // 1 second
    max: 100 // limit each IP to 100/1000 requests per windowMs
}));
app.use(cors({ origin: ["http://localhost", "'self'", "https://www.owlbear.rodeo"] }));
app.use(compression());
// ERROR HANDLING
function errorHandler(err, req, res, _next) {
    console.log("critical", err);
    res.status(500).json({ error: "An unknown error occured." });
}
app.use(errorHandler);
process.on("unhandledRejection", (err, origin) => {
    console.log("critical", `Unhandled rejection: ${err}; From: ${origin} `);
});
process.on("uncaughtException", (err, origin) => {
    console.log("critical", `Uncaught exception: ${err}. From: ${origin}`);
});
