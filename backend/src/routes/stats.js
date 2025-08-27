// backend/src/routes/stats.js
import { Router } from "express";
import { db } from "../db.js";

const router = Router();

/** Fill missing days with 0 so charts look continuous */
function fillSeries(rows, days = 30) {
  const map = new Map(rows.map(r => [r.day, r.count]));
  const out = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const key = `${y}-${m}-${dd}`;
    out.push({ date: key, count: map.get(key) || 0 });
  }
  return out;
}

router.get("/", async (_req, res) => {
  try {
    // totals
    const usersTotal = await db.get("SELECT COUNT(*) AS count FROM users");
    const propsTotal = await db.get("SELECT COUNT(*) AS count FROM properties");

    // per-day (last 30d)
    const usersDaily = await db.all(
      `SELECT strftime('%Y-%m-%d', created_at) AS day, COUNT(*) AS count
       FROM users
       WHERE datetime(created_at) >= datetime('now','-30 day')
       GROUP BY day ORDER BY day ASC`
    );
    const propsDaily = await db.all(
      `SELECT strftime('%Y-%m-%d', created_at) AS day, COUNT(*) AS count
       FROM properties
       WHERE datetime(created_at) >= datetime('now','-30 day')
       GROUP BY day ORDER BY day ASC`
    );

    // category breakdown
    const byCategory = await db.all(
      `SELECT COALESCE(category, 'Uncategorized') AS category, COUNT(*) AS count
       FROM properties
       GROUP BY category
       ORDER BY count DESC`
    );

    // newest users last 30d
    const newUsers = await db.all(
      `SELECT id, name, email, created_at
       FROM users
       WHERE datetime(created_at) >= datetime('now','-30 day')
       ORDER BY datetime(created_at) DESC
       LIMIT 50`
    );

    res.json({
      users: {
        total: usersTotal?.count || 0,
        by_day: fillSeries(usersDaily, 30),
        last_30d_new: newUsers,
      },
      properties: {
        total: propsTotal?.count || 0,
        by_day: fillSeries(propsDaily, 30),
        by_category: byCategory,
      },
      generated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Stats error", err);
    res.status(500).json({ error: "Failed to compute stats" });
  }
});

export default router;
