// backend/src/uploads.js
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// As you requested: save into frontend build images folder
// .../backend/src  →  ../../frontend/build/images/houses
export const UPLOAD_DIR = path.resolve(__dirname, "../../frontend/build/images/houses");

// Ensure directory exists
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ts = Date.now();
    const safe = file.originalname.replace(/[^a-zA-Z0-9_.-]/g, "_");
    const ext = path.extname(safe) || ".jpg";
    const base = path.basename(safe, ext);
    cb(null, `${ts}-${base}${ext}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB per file
  fileFilter: (_req, file, cb) => {
    if (!/^image\/(png|jpe?g|gif|webp|bmp|svg\+xml)$/i.test(file.mimetype)) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  },
});
