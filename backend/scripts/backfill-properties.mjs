// backend/scripts/backfill-properties.mjs
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";
import { fileURLToPath } from "url";

// --- DB path handling ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CLI usage:
//   node backend/scripts/backfill-properties.mjs "C:\path\to\data\db.db"
// or rely on env SQLITE_DB, or fallback to ../data/db.db
const DB_FILE =
  process.argv[2] ||
  process.env.SQLITE_DB ||
  path.join(__dirname, "../data/db.db");

// --- helpers ---
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const choice = (arr) => arr[randInt(0, arr.length - 1)];
const subset = (arr) => {
  const out = [];
  for (const v of arr) if (Math.random() < 0.5) out.push(v);
  // Guarantee at least one item
  if (!out.length) out.push(choice(arr));
  return [...new Set(out)];
};
const pickDistinct = (pool, count, ensureFirst) => {
  const set = new Set();
  if (ensureFirst) set.add(ensureFirst);
  while (set.size < count) set.add(choice(pool));
  return Array.from(set).slice(0, count);
};
const baseName = (p) => {
  if (!p) return null;
  const s = String(p);
  const ix = Math.max(s.lastIndexOf("/"), s.lastIndexOf("\\")); // windows too
  return ix >= 0 ? s.slice(ix + 1) : s;
};

// --- pools ---
const allImages = [
  "image1.jpg","image2.jpg","image3.jpg","image4.jpg",
  "image5.jpg","image6.jpg","image7.jpg","image8.jpg",
  "villa1.jpg","condo1.jpg","apartment1.jpg","house1.jpg"
];

const categories = ["Houses", "Apartments", "Condos", "Townhomes", "Offices", "Retails", "Land"];
const amenitiesPool = [
  "Air Conditioning","Security System","Parking Space","Gym Room",
  "Free WIFI","Fire Place","Swimming Pool","Balcony","Garden","Playground",
  "Doorman","24/7 Security","BBQ Area","Storage","Laundry"
];

const streets = [
  "Ocean Drive","Sunset Blvd","Maple Ave","Pine Street","Cedar Lane",
  "Elm Street","Oak Avenue","Queen Noor St","Zahran St","Wasfi Al Tal"
];

const neighborhoodsByCity = {
  "Los Angeles": ["Hollywood","Brentwood","Silver Lake","Venice","Studio City"],
  "Miami": ["South Beach","Brickell","Wynwood","Midtown","Coconut Grove"],
  "New York": ["Chelsea","SoHo","Upper East Side","Harlem","Williamsburg"],
  "Austin": ["Zilker","Mueller","Hyde Park","South Congress","East Austin"]
};

// --- derive category from title (light heuristic) ---
const deriveCategoryFromTitle = (title = "") => {
  const t = title.toLowerCase();
  if (t.includes("villa")) return "Houses";
  if (t.includes("condo")) return "Condos";
  if (t.includes("apartment")) return "Apartments";
  if (t.includes("house")) return "Houses";
  if (t.includes("office")) return "Offices";
  return choice(categories);
};

// --- derive type from title ---
const deriveTypeFromTitle = (title = "") => {
  const t = title.toLowerCase();
  if (t.includes("rent")) return "rental";
  if (t.includes("sale") || t.includes("sell")) return "sale";
  return Math.random() < 0.5 ? "rental" : "sale";
};

(async () => {
  const db = await open({ filename: DB_FILE, driver: sqlite3.Database });
  await db.exec("PRAGMA foreign_keys = ON;");
  await db.exec("PRAGMA busy_timeout = 5000;");

  const rows = await db.all(`SELECT * FROM properties ORDER BY id ASC;`);

  if (!rows.length) {
    console.log("No rows in properties table. Nothing to backfill.");
    process.exit(0);
  }

  const updateStmt = await db.prepare(`
    UPDATE properties
       SET location = ?,
           type = ?,
           listed_in = ?,
           category = ?,
           images_json = ?,
           amenities_json = ?,
           features_json = ?,
           address_json = ?
     WHERE id = ?
  `);

  for (const row of rows) {
    // Location
    const city = row.city || choice(["Los Angeles","Miami","New York","Austin"]);
    const state = row.state || choice(["CA","FL","NY","TX"]);
    const location = `${city}, ${state}`;

    // Type + listed_in
    const type = deriveTypeFromTitle(row.title);
    const listed_in = type === "rental" ? "rentals" : "sales";

    // Category
    const category = deriveCategoryFromTitle(row.title);

    // Images
    const heroName = baseName(row.image_url) || choice(allImages);
    const images = pickDistinct(allImages, 4, heroName);

    // Amenities
    const amenities = subset(amenitiesPool);

    // Features (simple randomization)
    const bedrooms = category === "Offices" || category === "Retails" ? 0 : randInt(1, 6);
    const features = {
      bedrooms,
      status: 1,
      garage: randInt(0, 2),
      elevator: Math.random() < 0.5 ? 1 : 0,
      kitchen: Math.random() < 0.85 ? 1 : 0
    };

    // Address
    const hoodList = neighborhoodsByCity[city] || ["Central","West Side","East Side","North","South"];
    const address = {
      address: `${randInt(10, 9999)} ${choice(streets)}`,
      county: state,            // simple fill
      city,
      street: choice(streets),
      area: choice(hoodList)
    };

    await updateStmt.run(
      location,
      type,
      listed_in,
      category,
      JSON.stringify(images),
      JSON.stringify(amenities),
      JSON.stringify(features),
      JSON.stringify(address),
      row.id
    );

    console.log(`Updated property id=${row.id} (${row.title})`);
  }

  await updateStmt.finalize();
  await db.close();
  console.log("\n✅ Backfill complete.");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
