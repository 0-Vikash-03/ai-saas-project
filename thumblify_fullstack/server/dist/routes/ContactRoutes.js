import express from "express";
import { sendContactMessage } from "../controllers/ContactController.js";
const ContactRouter = express.Router();
ContactRouter.post("/", sendContactMessage);
export default ContactRouter;
