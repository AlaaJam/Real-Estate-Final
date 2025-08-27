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
const toInt = (v, d = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
};
const baseName = (p) => {
  if (!p) return null;
  const s = String(p);
  const ix = Math.max(s.lastIndexOf("/"), s.lastIndexOf("\\"));
  return ix >= 0 ? s.slice(ix + 1) : s;
};
const choice = (arr) => arr[Math.floor(Math.random() * arr.length)];
const categories = ["Houses","Apartments","Condos","Townhomes","Offices","Retails","Land"];

const deriveCategoryFromTitle = (title = "") => {
  const t = title.toLowerCase();
  if (t.includes("villa") || t.includes("house")) return "Houses";
  if (t.includes("condo")) return "Condos";
  if (t.includes("apartment")) return "Apartments";
  if (t.includes("office")) return "Offices";
  return choice(categories);
};
const deriveTypeFromListedIn = (listedIn = "") => {
  const l = String(listedIn).toLowerCase();
  if (l === "rentals" || l === "rental") return "rental";
  if (l === "sales" || l === "sale") return "sale";
  return "sale";
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

// ---------- shape row -> API object ----------
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

    userId: row.user_id || null,
    owner: row.owner_id ? { id: row.owner_id, name: row.owner_name, email: row.owner_email } : null,
  };
};


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
    requireAuth,     
  upload.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "gallery", maxCount: 20 },
  ]),
  async (req, res) => {
    try {
      // basic fields
      const title       = (req.body.title || "").trim();
      const description = (req.body.description || "").trim();
      const price       = toInt(req.body.price, null);
      const city        = (req.body.city || "").trim();
      const state       = (req.body.state || "").trim();
      const featured    = req.body.featured === "1" || req.body.featured === "true" ? 1 : 0;

      if (!title) return res.status(400).json({ message: "Title is required" });

      // listed/category (sent by UI, optional)
      const listedIn = (req.body.listedIn || "").trim();             // "rentals" or "sales"
      const category = (req.body.category || "").trim() || deriveCategoryFromTitle(title);
      const type     = deriveTypeFromListedIn(listedIn);

      // amenities: accept comma/line separated or JSON
      let amenities = [];
      if (req.body.amenities) {
        if (Array.isArray(req.body.amenities)) {
          amenities = req.body.amenities.flat().map(s => String(s).trim()).filter(Boolean);
        } else {
          const txt = String(req.body.amenities);
          try { amenities = JSON.parse(txt); } catch {
            amenities = txt.split(/[,\n]+/).map(s => s.trim()).filter(Boolean);
          }
        }
      }

      // features/address as JSON strings
      const features = safeJSON(req.body.features, {});
      const address  = safeJSON(req.body.address, {});
      const location =
        (address.city && address.state) ? `${address.city}, ${address.state}` :
        [city, state].filter(Boolean).join(", ");

      // images
      const main = req.files?.mainImage?.[0]?.filename || null;
      const gallery = (req.files?.gallery || []).map(f => f.filename);
      const images = main ? [main, ...gallery] : gallery;
      const image_url = main
        ? `/images/houses/${main}`
        : (images[0] ? `/images/houses/${images[0]}` : null);

      const result = await db.run(
        `
        INSERT INTO properties
          (title, description, price, city, state, image_url, featured,
           location, type, listed_in, category,
           images_json, amenities_json, features_json, address_json,user_id)    
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          title, description, price, city, state, image_url, featured,
          location, type, listedIn || (type === "rental" ? "rentals" : "sales"), category,
          JSON.stringify(images), JSON.stringify(amenities),
          JSON.stringify(features), JSON.stringify(address),
           userId,
        ]
      );

      const row = await db.get(`SELECT * FROM properties WHERE id = ?`, result.lastID);
      return res.status(201).json(rowToProperty(row));
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: "Failed to create property" });
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
