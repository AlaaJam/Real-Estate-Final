// frontend/src/pages/add-listing.js
import React, { useState } from "react";
import { useHistory } from "react-router-dom"; // v5
import { HeaderContainer, FooterContainer } from "../containers";
import { Section } from "../components";
import { api } from "../helpers/api";

const pageStyle  = { minHeight: "100vh", display: "flex", flexDirection: "column" };
const mainStyle  = { flex: 1 };
const formWrap   = { margin: "24px auto", maxWidth: 900 };
const grid       = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 };
const row        = { display: "grid", gridTemplateColumns: "1fr", gap: 8, marginBottom: 12 };
const full       = { gridColumn: "1 / -1" };
const label      = { fontWeight: 600 };
const input      = { padding: 10, border: "1px solid #e5e7eb", borderRadius: 6 };
const textarea   = { ...input, minHeight: 110, resize: "vertical" };
const help       = { fontSize: 12, color: "#6b7280" };
const actions    = { display: "flex", gap: 12, marginTop: 16 };
const btn        = { padding: "10px 16px", borderRadius: 8, border: 0, cursor: "pointer" };
const primaryBtn = { ...btn, background: "#2563eb", color: "white" };




export default function AddListingPage() {
  const history = useHistory();

const [listedIn, setListedIn] = useState("sales");   // "rentals" or "sales"
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

  // const [ setImages] = useState("");     // comma/line separated
  const [amenities, setAmenities] = useState(""); // comma/line separated
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

 

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

    // NEW: taxonomy
    fd.append("listedIn", listedIn);
    fd.append("category", category);

    // NEW: JSON blobs (as strings)
    // features -> numbers where appropriate
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

    // NEW: amenities (comma/line separated string OK)
    fd.append("amenities", amenities || "");

    // files
    if (mainImageFile) fd.append("mainImage", mainImageFile);
    galleryFiles.forEach(file => fd.append("gallery", file));

    const created = await api("/api/properties", {
      method: "POST",
      body: fd, // don't set Content-Type manually
    });

    history.push(`/property/${created.id}`);
  } catch (err) {
    setError(err.message || "Failed to save");
  } finally {
    setSaving(false);
  }
};


  // const reset = () => {
  //   setBase({ title: "", price: "", city: "", state: "", imageUrl: "", description: "", featured: false });
  //   setFeatures({ bedrooms: 0, bathrooms: 0, garage: 0, status: "Active", kitchen: "Available", elevator: "No" });
  //   setAddress({ address: "", city: "", state: "", county: "", area: "", street: "", zip: "" });
  //   setImages("");
  //   setAmenities("");
  //   setError("");
  // };

  return (
    <div style={pageStyle}>
      <HeaderContainer /> {/* nav only */}

      <main style={mainStyle}>
        <Section style={formWrap}>
          <Section.InnerContainer>
            <Section.Title>Add Property</Section.Title>

            <form onSubmit={onSubmit}>
              <div style={grid}>
                {/* Base info */}
                <div style={row}>
                  <label style={label}>Title *</label>
                  <input style={input} value={base.title} onChange={e => setBase({ ...base, title: e.target.value })} required />
                </div>

                <div style={row}>
                  <label style={label}>Price</label>
                  <input type="number" min="0" step="1" style={input}
                    value={base.price}
                    onChange={e => setBase({ ...base, price: e.target.value })}
                  />
                </div>

                <div style={row}>
                  <label style={label}>City</label>
                  <input style={input} value={base.city} onChange={e => setBase({ ...base, city: e.target.value })} />
                </div>

                <div style={row}>
                  <label style={label}>State</label>
                  <input style={input} value={base.state} onChange={e => setBase({ ...base, state: e.target.value })} />
                </div>


                <div style={row}>
  <label style={label}>Listed In *</label>
  <select style={input} value={listedIn} onChange={e => setListedIn(e.target.value)} required>
    <option value="sales">Sales</option>
    <option value="rentals">Rentals</option>
  </select>
</div>

<div style={row}>
  <label style={label}>Category *</label>
  <select style={input} value={category} onChange={e => setCategory(e.target.value)} required>
    <option>Houses</option>
    <option>Apartments</option>
    <option>Condos</option>
    <option>Townhomes</option>
    <option>Offices</option>
    <option>Retails</option>
    <option>Land</option>
  </select>
</div>


                <div style={{ ...row, ...full }}>
  <label style={label}>Main Image</label>
  <input
    style={input}
    type="file"
    accept="image/*"
    onChange={(e) => setMainImageFile(e.target.files?.[0] || null)}
  />
  <div style={help}>Upload exactly one image for the main photo.</div>
</div>


                <div style={{...row, ...full}}>
                  <label style={label}>Description</label>
                  <textarea style={textarea} value={base.description} onChange={e => setBase({ ...base, description: e.target.value })} />
                </div>

              <div style={{ ...row, ...full }}>
  <label style={label}>Gallery Images</label>
  <input
    style={input}
    type="file"
    multiple
    accept="image/*"
    onChange={(e) => setGalleryFiles(Array.from(e.target.files || []))}
  />
  <div style={help}>You can select multiple images.</div>
</div>


                <div style={{...row, ...full}}>
                  <label style={label}>Amenities</label>
                  <textarea
                    style={textarea}
                    value={amenities}
                    onChange={e => setAmenities(e.target.value)}
                    placeholder="Air Conditioning, Security System, Balcony, ..."
                  />
                </div>

                {/* Features */}
                <div style={row}>
                  <label style={label}>Bedrooms</label>
                  <input type="number" min="0" step="1" style={input}
                    value={features.bedrooms}
                    onChange={e => setFeatures({ ...features, bedrooms: e.target.value })}
                  />
                </div>
                <div style={row}>
                  <label style={label}>Bathrooms</label>
                  <input type="number" min="0" step="1" style={input}
                    value={features.bathrooms}
                    onChange={e => setFeatures({ ...features, bathrooms: e.target.value })}
                  />
                </div>
                <div style={row}>
                  <label style={label}>Garage</label>
                  <input type="number" min="0" step="1" style={input}
                    value={features.garage}
                    onChange={e => setFeatures({ ...features, garage: e.target.value })}
                  />
                </div>
                <div style={row}>
                  <label style={label}>Status</label>
                  <input style={input} value={features.status}
                    onChange={e => setFeatures({ ...features, status: e.target.value })}
                  />
                </div>
                <div style={row}>
                  <label style={label}>Kitchen</label>
                  <input style={input} value={features.kitchen}
                    onChange={e => setFeatures({ ...features, kitchen: e.target.value })}
                  />
                </div>
                <div style={row}>
                  <label style={label}>Elevator</label>
                  <input style={input} value={features.elevator}
                    onChange={e => setFeatures({ ...features, elevator: e.target.value })}
                  />
                </div>

                {/* Address */}
                <div style={{...row, ...full}}>
                  <label style={label}>Address (line)</label>
                  <input style={input} value={address.address} onChange={e => setAddress({ ...address, address: e.target.value })} />
                </div>
                <div style={row}>
                  <label style={label}>City</label>
                  <input style={input} value={address.city} onChange={e => setAddress({ ...address, city: e.target.value })} />
                </div>
                <div style={row}>
                  <label style={label}>State</label>
                  <input style={input} value={address.state} onChange={e => setAddress({ ...address, state: e.target.value })} />
                </div>
                <div style={row}>
                  <label style={label}>County/Sub-County</label>
                  <input style={input} value={address.county} onChange={e => setAddress({ ...address, county: e.target.value })} />
                </div>
                <div style={row}>
                  <label style={label}>Area</label>
                  <input style={input} value={address.area} onChange={e => setAddress({ ...address, area: e.target.value })} />
                </div>
                <div style={row}>
                  <label style={label}>Street</label>
                  <input style={input} value={address.street} onChange={e => setAddress({ ...address, street: e.target.value })} />
                </div>
                <div style={row}>
                  <label style={label}>ZIP</label>
                  <input style={input} value={address.zip} onChange={e => setAddress({ ...address, zip: e.target.value })} />
                </div>

                {/* Actions */}
                <div style={{ ...actions, ...full }}>
                  <button type="submit" style={primaryBtn} disabled={saving}>
                    {saving ? "Saving..." : "Create Property"}
                  </button>
                </div>

                {error && (
                  <div style={{...full, color: "#b91c1c", marginTop: 4}}>{error}</div>
                )}
              </div>
            </form>
          </Section.InnerContainer>
        </Section>
      </main>

      <FooterContainer />
    </div>
  );
}
