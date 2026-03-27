import express from "express";
import cors from "cors";
import "dotenv/config";

import connectDB from "./configs/db.js";

// Routes
import AuthRouter from "./routes/AuthRoutes.js";
import ThumbnailRouter from "./routes/ThumbnailRoutes.js";
import UserRouter from "./routes/UserRoutes.js";
import ContactRouter from "./routes/ContactRoutes.js";
import scriptRoutes from "./routes/scriptRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import videoRoutes from "./routes/videoRoutes.js";

await connectDB();

const app = express();

// ✅ TRUST PROXY
app.set("trust proxy", 1);

// ✅ SIMPLE CORS (FIXED)
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// ✅ BODY PARSER
app.use(express.json());

// ✅ HEALTH CHECK
app.get("/", (req, res) => {
  res.send("Server is Live 🚀");
});

// ✅ ROUTES
app.use("/api/auth", AuthRouter);
app.use("/api/thumbnail", ThumbnailRouter);
app.use("/api/user", UserRouter);
app.use("/api/contact", ContactRouter);
app.use("/api/script", scriptRoutes);
app.use("/api/blog", blogRoutes);
app.use("/api/video", videoRoutes);

// ✅ ERROR HANDLER
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err);
  res.status(500).json({ message: err.message || "Server Error" });
});

// ✅ START
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});