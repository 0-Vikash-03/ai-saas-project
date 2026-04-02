import express from "express";
import {
  generateScript,
  getScripts,
  deleteScript,
  toggleFavorite
} from "../controllers/scriptController.js";

const router = express.Router();

router.post("/generate-script", generateScript);
router.get("/history", getScripts);

// ✅ NEW ROUTES
router.delete("/:id", deleteScript);
router.patch("/favorite/:id", toggleFavorite);

export default router;