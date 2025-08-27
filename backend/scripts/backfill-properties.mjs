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
// Choose which SQLite database file to open. Priority:
// 1) first CLI argument, 2) env var SQLITE_DB, 3) default ../data/db.db
const DB_FILE =
  process.argv[2] ||
  process.env.SQLITE_DB ||
  path.join(__dirname, "../data/db.db");


// Return a random integer between min and max (inclusive). Used to create varied dummy data.
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
// Pick and return one random element from an array.
const choice = (arr) => arr[randInt(0, arr.length - 1)];
// Return a random subset of an array (50% chance per item), but ensure at least one item.
const subset = (arr) => {
  const out = [];
  for (const v of arr) if (Math.random() < 0.5) out.push(v);
  // Guarantee at least one item so JSON fields never end up empty arrays.
  if (!out.length) out.push(choice(arr));
  // Remove duplicates just in case and return.
  return [...new Set(out)];
};
// Pick `count` distinct items from a pool. Optionally force-include `ensureFirst` as one of them.
const pickDistinct = (pool, count, ensureFirst) => {
  const set = new Set();
  if (ensureFirst) set.add(ensureFirst); // force hero image or similar to be present
  while (set.size < count) set.add(choice(pool)); // keep drawing until we have enough unique items
  return Array.from(set).slice(0, count); // trim to requested count
};
// Extract just the file name from a path (handles both / and \ for Windows).
const baseName = (p) => {
  if (!p) return null;
  const s = String(p);
  const ix = Math.max(s.lastIndexOf("/"), s.lastIndexOf("\\")); // support win + posix separators
  return ix >= 0 ? s.slice(ix + 1) : s;
};

// --- pools ---
// A pool of image file names we can assign to listings for gallery/hero images.
const allImages = [
  "image1.jpg","image2.jpg","image3.jpg","image4.jpg",
  "image5.jpg","image6.jpg","image7.jpg","image8.jpg",
  "villa1.jpg","condo1.jpg","apartment1.jpg","house1.jpg"
];

// High-level listing categories; used to backfill `category`.
const categories = ["Houses", "Apartments", "Condos", "Townhomes", "Offices", "Retails", "Land"];
// Amenities we might randomly attach to a property (stored as JSON).
const amenitiesPool = [
  "Air Conditioning","Security System","Parking Space","Gym Room",
  "Free WIFI","Fire Place","Swimming Pool","Balcony","Garden","Playground",
  "Doorman","24/7 Security","BBQ Area","Storage","Laundry"
];

// Street names to make addresses look more realistic.
const streets = [
  "Ocean Drive","Sunset Blvd","Maple Ave","Pine Street","Cedar Lane",
  "Elm Street","Oak Avenue","Queen Noor St","Zahran St","Wasfi Al Tal"
];

// Popular neighborhoods per city; used to populate the `address_json.area` field nicely.
const neighborhoodsByCity = {
  "Los Angeles": ["Hollywood","Brentwood","Silver Lake","Venice","Studio City"],
  "Miami": ["South Beach","Brickell","Wynwood","Midtown","Coconut Grove"],
  "New York": ["Chelsea","SoHo","Upper East Side","Harlem","Williamsburg"],
  "Austin": ["Zilker","Mueller","Hyde Park","South Congress","East Austin"]
};

// --- derive category from title (light heuristic) ---
// Try to infer a category based on keywords in the title. Otherwise, pick a random category.
const deriveCategoryFromTitle = (title = "") => {
  const t = title.toLowerCase();
  if (t.includes("villa")) return "Houses";
  if (t.includes("condo")) return "Condos";
  if (t.includes("apartment")) return "Apartments";
  if (t.includes("house")) return "Houses";
  if (t.includes("office")) return "Offices";
  return choice(categories); // fallback if we can't guess
};

// --- derive type from title ---
// Determine if the listing is a "rental" or "sale" by scanning keywords; otherwise randomize.
const deriveTypeFromTitle = (title = "") => {
  const t = title.toLowerCase();
  if (t.includes("rent")) return "rental";
  if (t.includes("sale") || t.includes("sell")) return "sale";
  return Math.random() < 0.5 ? "rental" : "sale";
};

// Immediately Invoked Async Function Expression: lets us use await at top level in a script.
(async () => {
  // Open a database connection to the chosen DB_FILE using sqlite's promise API.
  const db = await open({ filename: DB_FILE, driver: sqlite3.Database });
  // Enable foreign key constraints (off by default in SQLite), to respect relationships.
  await db.exec("PRAGMA foreign_keys = ON;");
  // Increase busy timeout so we wait a bit if the DB is locked (less "database is locked" errors).
  await db.exec("PRAGMA busy_timeout = 5000;");

  // Load all rows from the properties table; we'll backfill each one.
  const rows = await db.all(`SELECT * FROM properties ORDER BY id ASC;`);

  // If there are no properties, there's nothing to backfill—exit gracefully.
  if (!rows.length) {
    console.log("No rows in properties table. Nothing to backfill.");
    process.exit(0);
  }

  // Prepare an UPDATE statement once (faster + safer) for writing backfilled fields.
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

  // Iterate each property row and synthesize missing/derived fields.
  for (const row of rows) {
    // Location: prefer existing city/state; otherwise choose a random city/state.
    const city = row.city || choice(["Los Angeles","Miami","New York","Austin"]);
    const state = row.state || choice(["CA","FL","NY","TX"]);
    const location = `${city}, ${state}`; // human-readable location string

    // Type + listed_in: derive "rental"/"sale" and its matching collection name.
    const type = deriveTypeFromTitle(row.title);
    const listed_in = type === "rental" ? "rentals" : "sales";

    // Category: infer from title keywords; fallback to random category.
    const category = deriveCategoryFromTitle(row.title);

    // Images: use the existing image file name (if present) as the "hero", plus 3 more distinct images.
    const heroName = baseName(row.image_url) || choice(allImages);
    const images = pickDistinct(allImages, 4, heroName); // 4 unique images including hero

    // Amenities: random subset, but never empty (UI likes at least one amenity).
    const amenities = subset(amenitiesPool);

    // Features: small randomized set; offices/retails have zero bedrooms; others 1–6.
    const bedrooms = category === "Offices" || category === "Retails" ? 0 : randInt(1, 6);
    const features = {
      bedrooms,                 // numeric count
      status: 1,                // 1 = active (simple flag)
      garage: randInt(0, 2),    // number of garage spots
      elevator: Math.random() < 0.5 ? 1 : 0, // 0/1 boolean-ish
      kitchen: Math.random() < 0.85 ? 1 : 0  // 0/1 boolean-ish
    };

    // Address: fabricate a plausible street + area (neighborhood) for display/search.
    const hoodList = neighborhoodsByCity[city] || ["Central","West Side","East Side","North","South"];
    const address = {
      address: `${randInt(10, 9999)} ${choice(streets)}`, // street number + name
      county: state,            // reusing state code as county stand-in
      city,
      street: choice(streets),  // separate street field if UI needs it
      area: choice(hoodList)    // neighborhood/area within the city
    };

    // Execute the prepared update with all JSON fields stringified.
    await updateStmt.run(
      location,
      type,
      listed_in,
      category,
      JSON.stringify(images),
      JSON.stringify(amenities),
      JSON.stringify(features),
      JSON.stringify(address),
      row.id // WHERE id = ?
    );

    // Helpful log to see progress in the console.
    console.log(`Updated property id=${row.id} (${row.title})`);
  }

  // Finalize (close) the prepared statement to free resources.
  await updateStmt.finalize();
  // Close the DB connection cleanly.
  await db.close();
  // Let the operator know we're done.
  console.log("\n✅ Backfill complete.");
// Global error handler for the async IIFE: print error and exit non-zero for CI/scripts.
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
