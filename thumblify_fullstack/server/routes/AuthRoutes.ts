import express from "express";
import { registerUser, loginUser, verifyUser } from "../controllers/AuthControllers.js";
import protect from "../middlewares/auth.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/verify", protect, verifyUser);

export default router;