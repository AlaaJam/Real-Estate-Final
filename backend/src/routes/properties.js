// backend/src/routes/properties.js
import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { db } from "../db.js";
import { UPLOAD_DIR } from "../uploads.js";
import { requireAuth } from "../routes/auth.js";


const router = Router();

// ---------- helpers ----------
const safeJSON = (txt, fallback) => {
  try { return txt ? JSON.parse(txt) : fallback; } catch { return fallback; }
};


// ---------- multer (files -> /images/houses) ----------
fs.mkdirSync(UPLOAD_DIR, { recursive: true });
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "");
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});
const upload = multer({ storage });


const rowToProperty = (row) => ({
  id: row.id,
  title: row.title,
  description: row.description,
  price: row.price,
  city: row.city,
  state: row.state,
  location: row.location,
  imageUrl: row.image_url || "",
  images: safeJSON(row.images_json, []),
  amenities: safeJSON(row.amenities_json, []),
  features: safeJSON(row.features_json, {}),
  address: safeJSON(row.address_json, {}),
  type: row.type,
  listedIn: row.listed_in,
  category: row.category,
  featured: !!row.featured,
  createdAt: row.created_at,
  userId: row.user_id ?? null,
});


// ---------- GET list ----------
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
      SELECT * FROM properties
      ${whereSql}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `,
    lim, offset
  );
  res.json(rows.map(rowToProperty));
});

// ---------- GET detail ----------
router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return res.status(400).json({ message: "Invalid id" });

  const row = await db.get(
    `
    SELECT
      p.*,
      u.id   AS owner_id,
      u.name AS owner_name,
      u.email AS owner_email
    FROM properties p
    LEFT JOIN users u ON u.id = p.user_id
    WHERE p.id = ?
    `,
    id
  );

  if (!row) return res.status(404).json({ message: "Property not found" });
  res.json(rowToProperty(row));
});


// ---------- POST create (multipart/form-data) ----------
router.post(
  "/",
  requireAuth, // keep this if you want the creator captured from JWT
  upload.fields([{ name: "mainImage", maxCount: 1 }, { name: "gallery", maxCount: 20 }]),
  async (req, res) => {
    try {
      // 1) who created it (DEFINE THIS! avoids ReferenceError)
      const userId = req.user?.id ?? null;

      // 2) base fields
      const title       = (req.body.title || "").trim();
      const description = (req.body.description || "").trim();
      const price       = (req.body.price);
      const city        = (req.body.city || "").trim();
      const state       = (req.body.state || "").trim();
      const featured    = req.body.featured === "1" || req.body.featured === "true" ? 1 : 0;

      if (!title) return res.status(400).json({ message: "Title is required" });

      // 3) taxonomy
      const listedIn = (req.body.listedIn || "").trim() || "sales"; // "rentals" | "sales"
      const type     = listedIn === "rentals" ? "rental" : "sale";
      const category = (req.body.category || "").trim();

      // 4) JSON blobs
      const features  = safeJSON(req.body.features, {});
      const address   = safeJSON(req.body.address, {});
      const amenities = (() => {
        const raw = req.body.amenities;
        if (!raw) return [];
        try { return JSON.parse(raw); }
        catch { return String(raw).split(/[,\n]+/).map(s => s.trim()).filter(Boolean); }
      })();

      const location =
        (address.city && address.state) ? `${address.city}, ${address.state}` :
        [city, state].filter(Boolean).join(", ");

      // 5) files
      const main    = req.files?.mainImage?.[0]?.filename || null;
      const gallery = (req.files?.gallery || []).map(f => f.filename);
      const images  = main ? [main, ...gallery] : gallery;
      const image_url =
        main ? `/images/houses/${main}` :
        (images[0] ? `/images/houses/${images[0]}` : null);

      // 6) INSERT — 16 columns, 16 values; column names must match your DB (snake_case)
      const result = await db.run(
        `
        INSERT INTO properties
          (title, description, price, city, state, image_url, featured,
           location, type, listed_in, category,
           images_json, amenities_json, features_json, address_json,
           user_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          title, description, price, city, state, image_url, featured,
          location, type, listedIn, category,
          JSON.stringify(images), JSON.stringify(amenities),
          JSON.stringify(features), JSON.stringify(address),
          userId,
        ]
      );

      const row = await db.get(`SELECT * FROM properties WHERE id = ?`, result.lastID);
      return res.status(201).json(rowToProperty(row));
   } catch (e) {
  console.error("Create property failed:", e);
  return res
    .status(500)
    .json({ where: "POST /api/properties", message: e.message, code: e.code });
}
  }
);







router.get("/mine/list", requireAuth, async (req, res) => {
  const rows = await db.all(
    `
    SELECT p.*, u.id AS owner_id, u.name AS owner_name, u.email AS owner_email
    FROM properties p
    LEFT JOIN users u ON u.id = p.user_id
    WHERE p.user_id = ?
    ORDER BY p.created_at DESC
    `,
    req.user.id
  );
  res.json(rows.map(rowToProperty));
});


export default router;
