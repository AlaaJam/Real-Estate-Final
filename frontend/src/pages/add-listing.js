// frontend/src/pages/add-listing.js
import React, { useState, useMemo } from "react";
import { useHistory } from "react-router-dom"; // v5
import { HeaderContainer, FooterContainer } from "../containers";
import { Section } from "../components";
import { api } from "../helpers/api";

// ⚠️ DESIGN-ONLY REWRITE — submission logic & state shape are unchanged.
// - No new deps
// - Same fields & onSubmit
// - Pure UI/UX improvements (layout, spacing, previews, accessibility)

const pageStyle  = { minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f8fafc" };
const mainStyle  = { flex: 1 };
const formWrap   = { margin: "24px auto", maxWidth: "none", padding: "0 16px" };

// Reuse original primitives where helpful
const label      = { fontWeight: 700, fontSize: 14, color: "#0f172a" };
const inputBase  = { padding: 12, border: "1px solid #e5e7eb", borderRadius: 10, fontSize: 14, background: "#fff" };
const textarea   = { ...inputBase, minHeight: 140, resize: "vertical" };
const help       = { fontSize: 12, color: "#6b7280" };
const actionsBar = { position: "sticky", bottom: 0, background: "linear-gradient(to top, #ffffff, rgba(255,255,255,0.85))", padding: 12, borderTop: "1px solid #e5e7eb", display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 16, zIndex: 5 };
const btn        = { padding: "10px 16px", borderRadius: 10, border: 0, cursor: "pointer", fontWeight: 700 };
const primaryBtn = { ...btn, background: "#2563eb", color: "#fff" };
const ghostBtn   = { ...btn, background: "#f3f4f6", color: "#111827" };

const card = {
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  boxShadow: "0 1px 2px rgba(16,24,40,.04)",
  padding: 20,
};

const gridAuto = { display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" };
const field = { display: "grid", gap: 6 };

export default function AddListingPage() {
  const history = useHistory();

  const [listedIn, setListedIn] = useState("sales"); // "rentals" or "sales"
  const [category, setCategory] = useState("Houses");

  const [mainImageFile, setMainImageFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);

  const [base, setBase] = useState({
    title: "",
    price: "",
    city: "",
    state: "",
    imageUrl: "",
    description: "",
    featured: false,
  });

  const [features, setFeatures] = useState({
    bedrooms: 0,
    bathrooms: 0,
    garage: 0,
    status: "Active",
    kitchen: "Available",
    elevator: "No",
  });

  const [address, setAddress] = useState({
    address: "",
    city: "",
    state: "",
    county: "",
    area: "",
    street: "",
    zip: "",
  });

  const [amenities, setAmenities] = useState(""); // comma/line separated
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // ——— Read-only derivations for UI (do not alter submission payload) ———
  const mainPreview = useMemo(() => (mainImageFile ? URL.createObjectURL(mainImageFile) : null), [mainImageFile]);
  const galleryPreviews = useMemo(() => galleryFiles.map(f => URL.createObjectURL(f)), [galleryFiles]);
  const amenityChips = useMemo(() => amenities
    .split(/[\n,]/)
    .map(s => s.trim())
    .filter(Boolean)
  , [amenities]);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError("");

      const fd = new FormData();
      // basic fields
      fd.append("title",       base.title || "");
      fd.append("description", base.description || "");
      fd.append("price",       base.price || "");
      fd.append("city",        base.city || "");
      fd.append("state",       base.state || "");
      fd.append("featured",    base.featured ? "1" : "0");

      // taxonomy
      fd.append("listedIn", listedIn);
      fd.append("category", category);

      // features/address as JSON strings
      const featuresToSend = {
        bedrooms: Number(features.bedrooms) || 0,
        bathrooms: Number(features.bathrooms) || 0,
        garage: Number(features.garage) || 0,
        status: features.status || "Active",
        kitchen: features.kitchen || "Available",
        elevator: features.elevator || "No",
      };
      fd.append("features", JSON.stringify(featuresToSend));
      fd.append("address",  JSON.stringify(address));

      // amenities
      fd.append("amenities", amenities || "");

      // files
      if (mainImageFile) fd.append("mainImage", mainImageFile);
      galleryFiles.forEach(file => fd.append("gallery", file));

      const created = await api("/api/properties", { method: "POST", body: fd });
      history.push(`/property/${created.id}`);
    } catch (err) {
      setError(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={pageStyle}>
      {/* Local styles for responsive polish */}
      <style>{`
        .kicker { font-size: 12px; font-weight: 700; letter-spacing: .08em; color: #6366f1; text-transform: uppercase; }
        .title  { font-size: 28px; font-weight: 800; line-height: 1.1; color: #0b1324; margin-top: 4px; }
        .subtitle { color:#64748b; margin-top: 6px; }
        .section-head { display:flex; align-items:center; justify-content:space-between; margin-bottom: 12px; }
        .divider { height:1px; background:#e5e7eb; margin: 4px 0 16px; }
        .thumbs { display:grid; grid-template-columns: repeat(auto-fit, minmax(96px, 1fr)); gap: 8px; }
        .thumb { border:1px solid #e5e7eb; border-radius: 10px; overflow:hidden; background:#f8fafc; height:96px; display:flex; align-items:center; justify-content:center; }
        .thumb img { width:100%; height:100%; object-fit:cover; display:block; }
        .chips { display:flex; flex-wrap:wrap; gap:8px; margin-top: 6px; }
        .chip { font-size:12px; border:1px solid #e5e7eb; padding:4px 8px; border-radius: 999px; background:#fff; color:#0f172a; }
        @media (max-width: 720px) { .actions-bar { position: static; } }
      `}</style>

      <HeaderContainer />

      <main style={mainStyle}>
        <Section style={formWrap}>
          <Section.InnerContainer>
            <div className="page-head">
              <div className="kicker">Add New Property</div>
              <div className="title">Create listing</div>
              <div className="subtitle">Fill the details below. You can always edit later.</div>
            </div>

            {error && (
              <div role="alert" aria-live="polite" style={{ marginTop: 16, ...card, borderColor: "#fecaca", background: "#fff1f2" }}>
                <strong style={{ color: "#b91c1c" }}>Error:</strong> <span style={{ color: "#7f1d1d" }}>{error}</span>
              </div>
            )}

            <form onSubmit={onSubmit}>
              {/* ——— Listing Basics ——— */}
              <section style={{ ...card, marginTop: 16 }}>
                <header className="section-head">
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Listing basics</h3>
                  <span style={help}>Title, price, type</span>
                </header>
                <div className="divider" />

                <div style={gridAuto}>
                  <div style={field}>
                    <label style={label} htmlFor="title">Title <span style={{ color: "#ef4444" }}>*</span></label>
                    <input id="title" style={inputBase} value={base.title} onChange={e => setBase({ ...base, title: e.target.value })} required disabled={saving} placeholder="e.g., Modern 3BR Apartment" />
                  </div>

                  <div style={field}>
                    <label style={label} htmlFor="price">Price</label>
                    <input id="price" type="number" min="0" step="1" style={inputBase}
                      value={base.price}
                      onChange={e => setBase({ ...base, price: e.target.value })}
                      disabled={saving}
                      placeholder="e.g., 120000"
                    />
                    <div style={help}>Leave empty for POA.</div>
                  </div>

                  <div style={field}>
                    <label style={label} htmlFor="listedIn">Listed in <span style={{ color: "#ef4444" }}>*</span></label>
                    <select id="listedIn" style={inputBase} value={listedIn} onChange={e => setListedIn(e.target.value)} required disabled={saving}>
                      <option value="sales">Sales</option>
                      <option value="rentals">Rentals</option>
                    </select>
                  </div>

                  <div style={field}>
                    <label style={label} htmlFor="category">Category <span style={{ color: "#ef4444" }}>*</span></label>
                    <select id="category" style={inputBase} value={category} onChange={e => setCategory(e.target.value)} required disabled={saving}>
                      <option>Houses</option>
                      <option>Apartments</option>
                      <option>Condos</option>
                      <option>Townhomes</option>
                      <option>Offices</option>
                      <option>Retails</option>
                      <option>Land</option>
                    </select>
                  </div>

                  <div style={field}>
                    <label style={label} htmlFor="city">City</label>
                    <input id="city" style={inputBase} value={base.city} onChange={e => setBase({ ...base, city: e.target.value })} disabled={saving} placeholder="e.g., Amman" />
                  </div>

                  <div style={field}>
                    <label style={label} htmlFor="state">State</label>
                    <input id="state" style={inputBase} value={base.state} onChange={e => setBase({ ...base, state: e.target.value })} disabled={saving} placeholder="e.g., Jordan" />
                  </div>

                  <div style={{ ...field, gridColumn: "1 / -1" }}>
                    <label style={label} htmlFor="featured">
                      <input id="featured" type="checkbox" checked={!!base.featured} onChange={e => setBase({ ...base, featured: e.target.checked })} disabled={saving} style={{ marginRight: 8 }} />
                      Mark as featured
                    </label>
                    <div style={help}>Featured listings may appear prominently on the homepage.</div>
                  </div>
                </div>
              </section>

              {/* ——— Media ——— */}
              <section style={{ ...card, marginTop: 16 }}>
                <header className="section-head">
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Media</h3>
                  <span style={help}>Main photo & gallery</span>
                </header>
                <div className="divider" />

                <div style={{ ...gridAuto }}>
                  <div style={{ ...field, gridColumn: "1 / -1" }}>
                    <label style={label} htmlFor="mainImage">Main image</label>
                    <input id="mainImage" style={inputBase} type="file" accept="image/*" onChange={(e) => setMainImageFile(e.target.files?.[0] || null)} disabled={saving} />
                    <div style={help}>Upload exactly one image for the main photo.</div>
                    {mainPreview && (
                      <div style={{ marginTop: 8, border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>
                        <img src={mainPreview} alt="Main preview" style={{ width: "100%", maxHeight: 360, objectFit: "cover", display: "block" }} />
                      </div>
                    )}
                  </div>

                  <div style={{ ...field, gridColumn: "1 / -1" }}>
                    <label style={label} htmlFor="gallery">Gallery images</label>
                    <input id="gallery" style={inputBase} type="file" multiple accept="image/*" onChange={(e) => setGalleryFiles(Array.from(e.target.files || []))} disabled={saving} />
                    <div style={help}>You can select multiple images.</div>
                    {!!galleryPreviews.length && (
                      <div className="thumbs" style={{ marginTop: 8 }}>
                        {galleryPreviews.map((src, i) => (
                          <div className="thumb" key={i}>
                            <img src={src} alt={`Gallery ${i+1}`} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* ——— Description & Amenities ——— */}
              <section style={{ ...card, marginTop: 16 }}>
                <header className="section-head">
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Description & amenities</h3>
                  <span style={help}>Tell buyers/renters about the place</span>
                </header>
                <div className="divider" />

                <div style={gridAuto}>
                  <div style={{ ...field, gridColumn: "1 / -1" }}>
                    <label style={label} htmlFor="description">Description</label>
                    <textarea id="description" style={textarea} value={base.description} onChange={e => setBase({ ...base, description: e.target.value })} disabled={saving} placeholder="Spacious living room, natural light, near services..." />
                  </div>

                  <div style={{ ...field, gridColumn: "1 / -1" }}>
                    <label style={label} htmlFor="amenities">Amenities</label>
                    <textarea id="amenities" style={textarea} value={amenities} onChange={e => setAmenities(e.target.value)} disabled={saving} placeholder="Air Conditioning, Security System, Balcony, ..." />
                    {!!amenityChips.length && (
                      <div className="chips" aria-label="Amenities preview">
                        {amenityChips.map((a, i) => (
                          <span className="chip" key={i}>{a}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* ——— Features ——— */}
              <section style={{ ...card, marginTop: 16 }}>
                <header className="section-head">
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Unit features</h3>
                  <span style={help}>Rooms & facilities</span>
                </header>
                <div className="divider" />

                <div style={gridAuto}>
                  <div style={field}>
                    <label style={label} htmlFor="bedrooms">Bedrooms</label>
                    <input id="bedrooms" type="number" min="0" step="1" style={inputBase} value={features.bedrooms} onChange={e => setFeatures({ ...features, bedrooms: e.target.value })} disabled={saving} />
                  </div>
                  <div style={field}>
                    <label style={label} htmlFor="bathrooms">Bathrooms</label>
                    <input id="bathrooms" type="number" min="0" step="1" style={inputBase} value={features.bathrooms} onChange={e => setFeatures({ ...features, bathrooms: e.target.value })} disabled={saving} />
                  </div>
                  <div style={field}>
                    <label style={label} htmlFor="garage">Garage</label>
                    <input id="garage" type="number" min="0" step="1" style={inputBase} value={features.garage} onChange={e => setFeatures({ ...features, garage: e.target.value })} disabled={saving} />
                  </div>
                  <div style={field}>
                    <label style={label} htmlFor="status">Status</label>
                    <input id="status" style={inputBase} value={features.status} onChange={e => setFeatures({ ...features, status: e.target.value })} disabled={saving} />
                  </div>
                  <div style={field}>
                    <label style={label} htmlFor="kitchen">Kitchen</label>
                    <input id="kitchen" style={inputBase} value={features.kitchen} onChange={e => setFeatures({ ...features, kitchen: e.target.value })} disabled={saving} />
                  </div>
                  <div style={field}>
                    <label style={label} htmlFor="elevator">Elevator</label>
                    <input id="elevator" style={inputBase} value={features.elevator} onChange={e => setFeatures({ ...features, elevator: e.target.value })} disabled={saving} />
                  </div>
                </div>
              </section>

              {/* ——— Location ——— */}
              <section style={{ ...card, marginTop: 16 }}>
                <header className="section-head">
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Location</h3>
                  <span style={help}>Exact address (optional)</span>
                </header>
                <div className="divider" />

                <div style={gridAuto}>
                  <div style={{ ...field, gridColumn: "1 / -1" }}>
                    <label style={label} htmlFor="addr">Address line</label>
                    <input id="addr" style={inputBase} value={address.address} onChange={e => setAddress({ ...address, address: e.target.value })} disabled={saving} placeholder="Street & building" />
                  </div>
                  <div style={field}>
                    <label style={label} htmlFor="addrCity">City</label>
                    <input id="addrCity" style={inputBase} value={address.city} onChange={e => setAddress({ ...address, city: e.target.value })} disabled={saving} />
                  </div>
                  <div style={field}>
                    <label style={label} htmlFor="addrState">State</label>
                    <input id="addrState" style={inputBase} value={address.state} onChange={e => setAddress({ ...address, state: e.target.value })} disabled={saving} />
                  </div>
                  <div style={field}>
                    <label style={label} htmlFor="county">County/Sub-County</label>
                    <input id="county" style={inputBase} value={address.county} onChange={e => setAddress({ ...address, county: e.target.value })} disabled={saving} />
                  </div>
                  <div style={field}>
                    <label style={label} htmlFor="area">Area</label>
                    <input id="area" style={inputBase} value={address.area} onChange={e => setAddress({ ...address, area: e.target.value })} disabled={saving} />
                  </div>
                  <div style={field}>
                    <label style={label} htmlFor="street">Street</label>
                    <input id="street" style={inputBase} value={address.street} onChange={e => setAddress({ ...address, street: e.target.value })} disabled={saving} />
                  </div>
                  <div style={field}>
                    <label style={label} htmlFor="zip">ZIP</label>
                    <input id="zip" style={inputBase} value={address.zip} onChange={e => setAddress({ ...address, zip: e.target.value })} disabled={saving} />
                  </div>
                </div>
              </section>

              {/* ——— Actions ——— */}
              <div className="actions-bar" style={actionsBar}>
                <button type="button" style={ghostBtn} onClick={() => history.goBack()} disabled={saving}>Cancel</button>
                <button type="submit" style={{ ...primaryBtn, opacity: saving ? .8 : 1 }} disabled={saving}>
                  {saving ? "Saving…" : "Create Property"}
                </button>
              </div>
            </form>
          </Section.InnerContainer>
        </Section>
      </main>

      <FooterContainer />
    </div>
  );
}