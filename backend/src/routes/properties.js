// backend/src/routes/properties.js
import { Router } from "express";
import { db } from "../db.js";

const router = Router();

const safeJSON = (txt, fallback) => {
  try { return txt ? JSON.parse(txt) : fallback; } catch { return fallback; }
};

const rowToProperty = (row) => {
  const images = safeJSON(row.images_json, []);
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    price: row.price,
    city: row.city,
    state: row.state,
    location: row.location || [row.city, row.state].filter(Boolean).join(", "),
    imageUrl: row.image_url || (images[0] ? `/images/houses/${images[0]}` : ""),
    images,
    amenities: safeJSON(row.amenities_json, []),
    features: safeJSON(row.features_json, {}),
    address: safeJSON(row.address_json, {}),
    type: row.type || "rental",
    listedIn: row.listed_in || "",
    category: row.category || "",
    featured: !!row.featured,
    createdAt: row.created_at,
  };
};

// GET /api/properties?featured=true&limit=12&page=1
router.get("/", async (req, res) => {
  const { featured, limit = "12", page = "1" } = req.query;
  const lim = Math.max(1, parseInt(limit, 10));
  const pg = Math.max(1, parseInt(page, 10));
  const offset = (pg - 1) * lim;

  const where = [];
  if (featured === "true") where.push("featured = 1");
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const rows = await db.all(
    `
    SELECT *
    FROM properties
    ${whereSql}
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
    `,
    lim, offset
  );

  res.json(rows.map(rowToProperty));
});

// GET /api/properties/:id
router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return res.status(400).json({ message: "Invalid id" });

  const row = await db.get(`SELECT * FROM properties WHERE id = ?`, id);
  if (!row) return res.status(404).json({ message: "Property not found" });

  res.json(rowToProperty(row));
});

export default router;
