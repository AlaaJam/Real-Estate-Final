import { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { db } from "../db.js";

const router = Router();

//  Auth guard middleware: blocks requests without a valid JWT cookie.
export function requireAuth(req, res, next) {
  const token = req.cookies?.token;//converted
  if (!token) return res.status(401).json({ error: "Not authenticated" });
  try {
    // Verify token signature and expiration.
    // Must use the exact same secret that was used when signing the token.
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    // Attach decoded payload to req.user and continue.
    next();
  } catch {

    return res.status(401).json({ error: "Invalid token" });
  }
}


 //using id 
// ------------------- ME (who am I) -------------------
// (optional) GET /api/auth/me
router.get("/me", requireAuth, async (req, res) => {
  // Look up the current user by the id stored in the verified token payload.
  const user = await db.get(
    `SELECT id, name, email, created_at, phone, address1, city, state
     FROM users WHERE id = ?`,
    req.user.id
  );
  // Return the safe profile (no password)
  res.json(user);
});

// ------------------- SIGNUP / REGISTER -------------------
// POST /api/auth/signup (alias /register)
router.post(["/signup", "/register"], async (req, res) => {
  try {
    // Pull posted fields (expects express.json() to be enabled in server.js)
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ error: "name, email, password required" });
    }

    // Enforce unique email
    const existing = await db.get(`SELECT id FROM users WHERE email = ?`, email);
    if (existing) return res.status(409).json({ error: "Email already in use" });

    // Hash the password (salt rounds = 10)
    const hash = await bcrypt.hash(password, 10);

    // Store the user
    const result = await db.run(
      `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`,
      [name, email, hash]
    );

    // Prepare a token payload (keep it minimal)
    const payload = { id: result.lastID, email };

    // Sign a JWT (7 days)
    // Falls back to "dev_secret" only if JWT_SECRET is missing.
    const token = jwt.sign(payload, process.env.JWT_SECRET || "dev_secret", { expiresIn: "7d" });

    // Set the token in an HTTP-only cookie so JS can’t read it (XSS-safer)
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax", // reduces CSRF a bit
      secure: false,   // set true in production over HTTPS
      maxAge: 7 * 24 * 3600 * 1000,
    });

    // Return a safe user object back to the UI so it can update state instantly
    const user = { id: result.lastID, name, email };
    res.json({ success: true, message: " User stored successfully!", token, user });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Signup failed" });
  }
});

// ------------------- LOGIN -------------------
router.post("/login", async (req, res) => {
  try {
    // Read login fields
    const { email, password } = req.body;

    // Load user by email
    const user = await db.get("SELECT * FROM users WHERE email = ?", [email]);
    if (!user) return res.status(400).json({ success: false, message: " User not found" });

    // Compare plaintext vs stored bcrypt hash
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ success: false, message: " Invalid credentials" });

    // Create a token with id + email (7 days)
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || "dev_secret",
      { expiresIn: "7d" }
    );

    // Store it in an HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,          // set true in production over HTTPS
      maxAge: 7 * 24 * 3600 * 1000,
    });

    // Return a safe public snapshot (no password)
    const safeUser = { id: user.id, name: user.name, email: user.email, created_at: user.created_at };
    res.json({ success: true, message: " Login successful", token, user: safeUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: " Login failed" });
  }
});

// ------------------- LOGOUT -------------------
// POST /api/auth/logout
router.post("/logout", (_req, res) => {
  // Delete the token cookie
  res.clearCookie("token");
  res.json({ success: true });
});

// Export router so server.js can mount it, e.g. app.use("/api/auth", router)
export default router;
