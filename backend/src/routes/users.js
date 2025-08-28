import { Router } from "express";
import { db } from "../db.js";
import { requireAuth } from "./auth.js";

const router = Router();

// GET /api/users/me
router.get("/me", requireAuth, async (req, res) => {
    const me = await db.get(
        `SELECT id, name, email, created_at, phone, address1, city, state
     FROM users WHERE id = ?`,
        req.user.id
    );
    if (!me) return res.status(404).json({ error: "User not found" });
    res.json(me);
});

// PUT /api/users/me
router.put("/me", requireAuth, async (req, res) => {
    const { name, phone, address1, city, state } = req.body || {};
    await db.run(
        // “use the new value if it’s not NULL / for partial updates.
        `UPDATE users
     SET name = COALESCE(?, name),
         phone = COALESCE(?, phone),
         address1 = COALESCE(?, address1),
         city = COALESCE(?, city),
         state = COALESCE(?, state)
     WHERE id = ?`,
        [name, phone, address1, city, state, req.user.id]
    );
    const updated = await db.get(
        `SELECT id, name, email, created_at, phone, address1, city, state
     FROM users WHERE id = ?`,
        req.user.id
    );
    res.json({ success: true, user: updated });
});

export default router;