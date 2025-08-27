// frontend/src/pages/dashboard.js
import React, { useEffect, useState } from "react";
import { HeaderContainer, DashboardContainer, FooterContainer } from "../containers";
import { Section } from "../components";
// Removed BarGraph (unused)
import TimeSeriesLine from "../helpers/TimeSeriesLine";
import { getPropertyList } from "../redux/actions/propertiesAction";
import { getAgentList } from "../redux/actions/agentsAction";
import { api } from "../helpers/api";
import { useDispatch, useSelector } from "react-redux";

const fmt = (n) => (typeof n === "number" ? n.toLocaleString() : n ?? "—");

// ---- Blue theme tokens ----
const theme = {
  blueA: "#2563eb", // primary
  blueB: "#1e40af", // deep
  blueC: "#0ea5e9", // sky
  blueD: "#3b82f6", // bright
  slate0: "#ffffff",
  slate1: "#f8fafc",
  slate2: "#f1f5f9",
  slate3: "#e2e8f0",
  textMuted: "#64748b",
  textDark: "#0f172a",
  tableHeadBg: "#eff6ff",
  badgeBg: "#dbeafe",
  badgeText: "#1d4ed8",
};

const styles = {
  wrap: { display: "grid", gap: 24 },

  // KPIs
  kpiGrid: {
    display: "grid",
    gap: 16,
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  },
  kpi: (bgA, bgB) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 18,
    borderRadius: 16,
    color: "white",
    background: `linear-gradient(135deg, ${bgA}, ${bgB})`,
    boxShadow: "0 10px 30px rgba(2, 6, 23, .15)",
  }),
  kpiLeft: { display: "grid", gap: 6 },
  kpiLabel: { fontSize: 14, opacity: 0.9 },
  kpiNumber: { fontSize: 32, fontWeight: 800, lineHeight: 1.1 },
  kpiIcon: {
    width: 54,
    height: 54,
    borderRadius: 14,
    background: "rgba(255,255,255,.18)",
    display: "grid",
    placeItems: "center",
    fontSize: 20,
  },

  // Cards / charts
  chartGrid: {
    display: "grid",
    gap: 16,
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
  },
  card: {
    background: theme.slate0,
    borderRadius: 16,
    padding: 16,
    boxShadow: "0 8px 24px rgba(2, 6, 23, .08)",
    border: `1px solid ${theme.slate3}`,
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  cardTitle: { fontWeight: 700, fontSize: 16, color: theme.textDark },
  muted: { color: theme.textMuted, fontSize: 13 },

  // Table
  tableWrap: { overflowX: "auto" },
  table: {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: 0,
    borderRadius: 12,
    overflow: "hidden",
  },
  th: {
    textAlign: "left",
    padding: "12px 14px",
    background: theme.tableHeadBg,
    fontWeight: 700,
    fontSize: 13,
    color: "#1e3a8a",
    borderBottom: `1px solid ${theme.slate3}`,
  },
  td: {
    padding: "12px 14px",
    borderBottom: `1px solid ${theme.slate2}`,
    fontSize: 14,
    color: theme.textDark,
    background: theme.slate0,
  },
  badge: {
    display: "inline-block",
    padding: "4px 8px",
    borderRadius: 999,
    background: theme.badgeBg,
    color: theme.badgeText,
    fontSize: 12,
    fontWeight: 700,
  },
};

const Dashboard = () => {
  const dispatch = useDispatch();
  const { properties } = useSelector((state) => state.propertyList);

  const [stats, setStats] = useState(null);
  const [statsErr, setStatsErr] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dispatch(getAgentList());
    dispatch(getPropertyList());
  }, [dispatch]);

  useEffect(() => {
    (async () => {
      try {
        const data = await api("/api/stats");
        setStats(data);
      } catch (e) {
        setStatsErr(e.message || "Failed to load stats");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const totalProps = stats?.properties?.total ?? (properties?.length || 0);
  const totalUsers = stats?.users?.total ?? 0;
  const byDay = stats?.users?.by_day ?? [];
  const newest = stats?.users?.last_30d_new ?? [];

  return (
    <>
      <HeaderContainer bg={false} />
      <Section bgColor="--bs-fade-info">
        <Section.InnerContainer>
          <DashboardContainer title="Dashboard">
            <div style={styles.wrap}>
              {/* KPIs */}
              <div style={styles.kpiGrid}>
                <div style={styles.kpi(theme.blueA, theme.blueB)}>
                  <div style={styles.kpiLeft}>
                    <div style={styles.kpiLabel}>Total Properties</div>
                    <div style={styles.kpiNumber}>{fmt(totalProps)}</div>
                  </div>
                  <div style={styles.kpiIcon}>
                    <i className="fas fa-home" />
                  </div>
                </div>

                <div style={styles.kpi(theme.blueD, theme.blueC)}>
                  <div style={styles.kpiLeft}>
                    <div style={styles.kpiLabel}>Total Users</div>
                    <div style={styles.kpiNumber}>{fmt(totalUsers)}</div>
                  </div>
                  <div style={styles.kpiIcon}>
                    <i className="fas fa-users" />
                  </div>
                </div>
              </div>

              {/* Charts */}
              <div style={styles.chartGrid}>
                <div style={styles.card}>
                  <div style={styles.cardHeader}>
                    <div style={styles.cardTitle}>New users (last 30 days)</div>
                    {!loading && <span style={styles.muted}>{fmt(byDay.length)} points</span>}
                  </div>
                  {statsErr && (
                    <div style={{ color: "#dc2626", fontSize: 14, marginBottom: 8 }}>
                      {statsErr}
                    </div>
                  )}
                  {loading ? (
                    <div style={{ height: 280, background: theme.slate2, borderRadius: 12 }} />
                  ) : (
                    <TimeSeriesLine data={byDay} label="Users/day" />
                  )}
                </div>



              </div>

              {/* Newest Users */}
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <div style={styles.cardTitle}>Newest users (last 30 days)</div>
                  <span style={styles.muted}>{fmt(newest.length)} shown</span>
                </div>

                <div style={styles.tableWrap}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Name</th>
                        <th style={styles.th}>Email</th>
                        <th style={styles.th}>Created</th>
                        <th style={styles.th}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        Array.from({ length: 6 }).map((_, i) => (
                          <tr key={i}>
                            <td style={styles.td}>Loading…</td>
                            <td style={styles.td}>—</td>
                            <td style={styles.td}>—</td>
                            <td style={styles.td}>
                              <span style={styles.badge}>—</span>
                            </td>
                          </tr>
                        ))
                      ) : newest.length === 0 ? (
                        <tr>
                          <td style={styles.td} colSpan={4}>
                            &nbsp;No new users in the last 30 days.
                          </td>
                        </tr>
                      ) : (
                        newest.map((u) => (
                          <tr key={u.id}>
                            <td style={styles.td}>{u.name || "—"}</td>
                            <td style={styles.td}>{u.email}</td>
                            <td style={styles.td}>
                              {u.created_at ? new Date(u.created_at).toLocaleString() : "—"}
                            </td>
                            <td style={styles.td}>
                              <span style={styles.badge}>New</span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </DashboardContainer>
        </Section.InnerContainer>
      </Section>
      <FooterContainer />
    </>
  );
};

export default Dashboard;
