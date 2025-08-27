// src/helpers/api.js
const DEV_BASE = "http://localhost:7542"; // backend
const ENV_BASE = (process.env.REACT_APP_API_URL || DEV_BASE).replace(/\/$/, "");

/**
 * api("/api/properties?page=1")
 * api("api/properties/1")
 * api("http://localhost:7542/api/properties")
 */
export async function api(path, init = {}) {
  let url = path;

  if (!/^https?:\/\//i.test(path)) {
    // normalize: ensure it becomes http://localhost:7542/api/...
    const p = path.replace(/^\/+/, "");
    url = p.startsWith("api/") ? `${ENV_BASE}/${p}` :
      p.startsWith("/api/") ? `${ENV_BASE}${path}` :
        `${ENV_BASE}/api/${p}`;
  }

  // public GET: don't send cookies (avoids preflight headaches)
  const res = await fetch(url, {
    method: "GET",
    credentials: "omit",
    headers: { Accept: "application/json", ...(init.headers || {}) },
    ...init,
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}${txt ? ` - ${txt}` : ""}`);
  }
  return res.json();
}
