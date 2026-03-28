import express from "express";
import { generateScript } from "../controllers/scriptController.js";
const router = express.Router();
router.post("/generate-script", generateScript);
export default router;
