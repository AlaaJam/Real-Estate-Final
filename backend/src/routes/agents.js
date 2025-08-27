import { Router } from "express";
import { agents } from "../data/agents.js";

const router = Router();

// GET /api/agents?featured=true&limit=3
router.get("/", (req, res) => {
  let data = agents;
  const { featured, limit } = req.query;

  if (featured === "true") data = data.filter(a => a.featured === true);
  if (limit) data = data.slice(0, Number(limit));

  res.json(data);
});

// GET /api/agents/:id
router.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  const agent = agents.find(a => a.id === id);
  if (!agent) return res.status(404).json({ message: "Agent not found" });
  res.json(agent);
});

export default router;
