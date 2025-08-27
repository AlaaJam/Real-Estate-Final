import React, { useEffect, useState } from "react";
import { HeaderContainer, DashboardContainer, FooterContainer } from "../containers";
import { Section } from "../components";
import { api } from "../helpers/api"; // must send cookies (credentials: "include")

/* ---------- tiny helpers ---------- */
const fmtCurrency = (n, { currency = "JOD", locale = "en-US" } = {}) =>
  n == null || n === "" ? "" : `${currency} ${Number(n).toLocaleString(locale)}`;

const titleCase = (s) => (s ? String(s).toLowerCase().replace(/\b\w/g, m => m.toUpperCase()) : "");

/* ---------- styles ---------- */
const wrap = { paddingBlock: 8 };
const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
  gap: 20,
};
const card = {
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  overflow: "hidden",
  transition: "transform .15s ease, box-shadow .15s ease",
  boxShadow: "0 1px 2px rgba(16,24,40,.05)",
};
const cardHover = { transform: "translateY(-2px)", boxShadow: "0 8px 24px rgba(16,24,40,.08)" };

const body = { padding: 14 };
const titleS = { fontSize: 16, fontWeight: 700, lineHeight: 1.35, marginBottom: 6, color: "#0f172a" };
const meta = { color: "#6b7280", fontSize: 13, marginBottom: 10, lineHeight: 1.4 };
const chips = { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 };
const chip = {
  fontSize: 12,
  fontWeight: 600,
  padding: "4px 8px",
  borderRadius: 999,
  border: "1px solid #e5e7eb",
  color: "#334155",
  background: "#f8fafc",
};
const footer = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginTop: 4,
};
const priceS = { fontWeight: 800, fontSize: 16, color: "#111827" };
const linkBtn = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "8px 12px",
  borderRadius: 10,
  background: "#2563eb",
  color: "#fff",
  textDecoration: "none",
  fontSize: 13,
  fontWeight: 600,
  boxShadow: "0 1px 1px rgba(37,99,235,.25)",
};
const muted = { color: "#6b7280" };

/* skeleton styles */
const skel = { ...card, borderColor: "#eee", background: "#fff" };
const skelBar = { height: 10, background: "linear-gradient(90deg,#f2f4f7,#e6e9ef,#f2f4f7)", borderRadius: 8, animation: "shimmer 1.2s infinite" };

const MyListingList = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const data = await api("/api/properties/mine/list"); // backend uses JWT cookie
        if (alive) setRows(data || []);
      } catch (e) {
        if (alive) setErr(e.message || "Failed to load");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const Card = (p) => {
    const [hover, setHover] = useState(false);
 

    const loc = p.location || [p.city, p.state].filter(Boolean).join(", ");
    const listed = p.listedIn || p.listed_in || (p.type === "rental" ? "rentals" : "sales");
    const cat = titleCase(p.category || "");
    const type = p.type ? titleCase(p.type) : "";

    return (
      <div
        style={{ ...card, ...(hover ? cardHover : null) }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
       
        <div style={body}>
          <div style={titleS} title={p.title}>{p.title}</div>
          <div style={meta}>{loc || <span style={muted}>No location</span>}</div>

          <div style={chips}>
            {listed && <span style={chip}>{titleCase(listed)}</span>}
            {type && <span style={chip}>{type}</span>}
            {cat && <span style={chip}>{cat}</span>}
          </div>

          <div style={footer}>
            <div style={priceS}>{fmtCurrency(p.price)}</div>
            <a href={`/property/${p.id}`} style={linkBtn}>
              View
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    );
  };

  const SkeletonCard = () => (
    <div style={skel}>

      <div style={{ ...body }}>
        <div style={{ ...skelBar, width: "70%", marginBottom: 8 }} />
        <div style={{ ...skelBar, width: "40%", marginBottom: 12 }} />
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <div style={{ ...skelBar, width: 70 }} />
          <div style={{ ...skelBar, width: 56 }} />
          <div style={{ ...skelBar, width: 80 }} />
        </div>
        <div style={{ ...skelBar, width: 90 }} />
      </div>
    </div>
  );

  const Content = () => {
    if (loading) {
      return (
        <div style={grid}>
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      );
    }
    if (err) {
      // 401 here means user isn’t logged in or cookies weren’t sent
      return (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", padding: 14, borderRadius: 12 }}>
          {String(err)}
        </div>
      );
    }
    if (!rows.length) {
      return (
        <div style={{ textAlign: "center", padding: "48px 12px", color: "#6b7280" }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>📭</div>
          <div style={{ fontWeight: 700, color: "#111827" }}>No listings yet</div>
          <div style={{ marginTop: 6 }}>Create your first property from the “Add Listing” page.</div>
        </div>
      );
    }

    return (
      <div style={grid}>
        {rows.map((p) => <Card key={p.id} {...p} />)}
      </div>
    );
  };

  return (
    <>
      {/* local keyframes for shimmer */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200px 0; }
          100% { background-position: calc(200px + 100%) 0; }
        }
      `}</style>

      <HeaderContainer bg={false} />
      <Section style={wrap} bgColor="--bs-fade-info">
        <Section.InnerContainer>
          <DashboardContainer title="My Listings">
            <Content />
          </DashboardContainer>
        </Section.InnerContainer>
      </Section>
      <FooterContainer />
    </>
  );
};

export default MyListingList;
