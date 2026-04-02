import express from "express";
import { processPayment } from "../controllers/PaymentController.js";

const router = express.Router();

// ✅ THIS IS THE MISSING PART
router.post("/pay", processPayment);

export default router;