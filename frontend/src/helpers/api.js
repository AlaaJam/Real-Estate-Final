

export async function api(path, opts = {}) {
  const init = {
    credentials: "include",                    // ⬅️ IMPORTANT
    method: opts.method || "GET",
    headers:
      opts.body instanceof FormData
        ? (opts.headers || {})                 // let browser set multipart boundary
        : { "Content-Type": "application/json", ...(opts.headers || {}) },
    ...opts,
  };

  const url = (process.env.REACT_APP_API_URL || "http://localhost:7542") + path;
  const res = await fetch(url, init);

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`HTTP ${res.status} - ${msg}`);
  }
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : res.text();
}
