import { Router } from "express";
import { messages } from "../data/messages.js";

const router = Router();

// GET /api/messages
router.get("/", (_req, res) => res.json(messages));

export default router;
