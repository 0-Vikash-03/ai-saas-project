import express from "express";
import { generateScript, getScripts } from "../controllers/scriptController.js";

const router = express.Router();

router.post("/generate-script", generateScript);
router.get("/history", getScripts); // ✅ NEW ROUTE

export default router;