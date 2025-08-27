import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_FILE = process.env.SQLITE_DB || path.join(__dirname, "../data/db.db");

export const db = await open({
  filename: DB_FILE,
  driver: sqlite3.Database,
});

await db.exec("PRAGMA foreign_keys = ON;");
await db.exec("PRAGMA busy_timeout = 5000");

export async function ensurePropertiesTable() {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS properties (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      price REAL,
      city TEXT,
      state TEXT,
      image_url TEXT,
      featured INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const cols = await db.all(`PRAGMA table_info(properties);`);
  const have = new Set(cols.map(c => c.name));
  const addIfMissing = async (name, type) => {
    if (!have.has(name)) await db.exec(`ALTER TABLE properties ADD COLUMN ${name} ${type};`);
  };

  await addIfMissing("user_id", "INTEGER");                 // FK soft-link
await db.exec(`CREATE INDEX IF NOT EXISTS idx_prop_user ON properties(user_id);`);

  await addIfMissing("location", "TEXT");
  await addIfMissing("type", "TEXT");
  await addIfMissing("listed_in", "TEXT");
  await addIfMissing("category", "TEXT");
  await addIfMissing("images_json", "TEXT");    // ["image2.jpg", ...]
  await addIfMissing("amenities_json", "TEXT"); // ["Air Conditioning", ...]
  await addIfMissing("features_json", "TEXT");  // {"bedrooms":3, ...}
  await addIfMissing("address_json", "TEXT");   // {"address":"...", ...}
}


export async function ensureUsersTable() {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

export async function ensureUserProfileColumns() {
  const cols = await db.all(`PRAGMA table_info(users);`);
  const have = new Set(cols.map(c => c.name));
  const addIfMissing = async (name, type) => {
    if (!have.has(name)) await db.exec(`ALTER TABLE users ADD COLUMN ${name} ${type};`);
  };

  await addIfMissing("phone", "TEXT");
  await addIfMissing("address1", "TEXT");
  await addIfMissing("city", "TEXT");
  await addIfMissing("state", "TEXT");
}

export async function seedFakeProperties() {
  const { c } = await db.get(`SELECT COUNT(*) AS c FROM properties;`);
  if (c > 0) return; 

  const sample = [
    {
      title: "Apartment for rent",
      description: "Nice apartment with a great view.",
      price: 350000,
      city: "Amman",
      state: "Amman",
      featured: 1,
      location: "Amman, Jordan",
      type: "rental",
      listed_in: "rentals",
      category: "Apartments",
      images: ["image2.jpg","8.jpg","image7.jpg","image8.jpg"],
      amenities: ["Air Conditioning","Security System","Parking Space","Gym Room","Free WIFI","Fire Place"],
      features: { bedrooms: 3, status: 1, garage: 1, elevator: 1, kitchen: 1 },
      address: { address: "Abdoun", county: "Amman", city: "Amman", street: "Zahran St", area: "Amman" }
    },
    {
      title: "Renovated House For Sale",
      description: "Fully renovated, ready to move.",
      price: 35000,
      city: "Amman",
      state: "Amman",
      featured: 1,
      location: "Amman, Jordan",
      type: "sale",
      listed_in: "sales",
      category: "Houses",
      images: ["image8.jpg","image5.jpg","image7.jpg","image8.jpg"],
      amenities: ["Parking Space","Gym Room","Free WIFI","Fire Place"],
      features: { bedrooms: 3, status: 1, garage: 1, elevator: 0, kitchen: 1 },
      address: { address: "Khalda", county: "Amman", city: "Amman", street: "Wasfi Al Tal", area: "Amman" }
    },
    {
      title: "Offices for rent",
      description: "Modern offices in a prime location.",
      price: 35000,
      city: "Amman",
      state: "Amman",
      featured: 1,
      location: "Amman, Jordan",
      type: "rental",
      listed_in: "rentals",
      category: "Offices",
      images: ["image2.jpg","image8.jpg","image7.jpg","image8.jpg"],
      amenities: ["Air Conditioning","Security System","Parking Space"],
      features: { bedrooms: 0, status: 1, garage: 1, elevator: 1, kitchen: 0 },
      address: { address: "Shmeisani", county: "Amman", city: "Amman", street: "Queen Noor St", area: "Amman" }
    }
  ];

  const stmt = await db.prepare(`
    INSERT INTO properties
      (title, description, price, city, state, image_url, featured, location,
       type, listed_in, category, images_json, amenities_json, features_json, address_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const p of sample) {
    const image_url = `/images/houses/${p.images[0]}`; // صورة كـ hero
    await stmt.run(
      p.title, p.description, p.price, p.city, p.state, image_url, p.featured, p.location,
      p.type, p.listed_in, p.category,
      JSON.stringify(p.images), JSON.stringify(p.amenities),
      JSON.stringify(p.features), JSON.stringify(p.address)
    );
  }
  await stmt.finalize();
}


await ensurePropertiesTable();
await ensureUsersTable();
await ensureUserProfileColumns();
await seedFakeProperties();
