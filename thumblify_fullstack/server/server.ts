import express, { Request, Response } from "express";
import cors from "cors";
import "dotenv/config";
import session from "express-session";
import MongoStore from "connect-mongo";

import connectDB from "./configs/db.js";

// Routes
import AuthRouter from "./routes/AuthRoutes.js";
import ThumbnailRouter from "./routes/ThumbnailRoutes.js";
import UserRouter from "./routes/UserRoutes.js";
import ContactRouter from "./routes/ContactRoutes.js";
import scriptRoutes from "./routes/scriptRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import videoRoutes from "./routes/videoRoutes.js";

// Extend session types
declare module "express-session" {
    interface SessionData {
        isLoggedIn: boolean;
        userId: string;
    }
}

// Connect DB
await connectDB();

const app = express();

// 🔥 TRUST PROXY (IMPORTANT for Render)
app.set("trust proxy", 1);

// 🔥 CORS (FIXED for Vercel + Local)
const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://ai-saas-project-jade.vercel.app", // ⚠️ replace with your actual Vercel URL
];

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin) return callback(null, true);

            // ✅ allow localhost
            if (origin.includes("localhost")) {
                return callback(null, true);
            }

            // ✅ allow ALL vercel domains (production + preview)
            if (origin.includes("vercel.app")) {
                return callback(null, true);
            }

            return callback(new Error("Not allowed by CORS"));
        },
        credentials: true,
    })
);

// 🔥 BODY PARSER
app.use(express.json());

// 🔥 SESSION (FIXED)
app.use(
    session({
        name: "connect.sid",
        secret: process.env.SESSION_SECRET as string,
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: process.env.MONGODB_URI as string,
            collectionName: "sessions",
        }),
        cookie: {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // HTTPS required
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        },
    })
);

// 🔥 HEALTH CHECK
app.get("/", (req: Request, res: Response) => {
    res.send("Server is Live 🚀");
});

// 🔥 ROUTES
app.use("/api/auth", AuthRouter);
app.use("/api/thumbnail", ThumbnailRouter);
app.use("/api/user", UserRouter);
app.use("/api/contact", ContactRouter);
app.use("/api/script", scriptRoutes);
app.use("/api/blog", blogRoutes);
app.use("/api/video", videoRoutes);

// 🔥 ERROR HANDLER (IMPORTANT)
app.use((err: any, req: Request, res: Response, next: any) => {
    console.error(err);
    res.status(500).json({ message: err.message || "Server Error" });
});

// 🔥 START SERVER
const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
});