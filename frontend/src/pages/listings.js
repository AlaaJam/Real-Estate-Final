// src/pages/listings.js
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { HeaderContainer, ListingItemContainer, FooterContainer } from "../containers";
import { Section } from "../components";
import { getPropertyList } from "../redux/actions/propertiesAction";

const pageStyle  = { minHeight: "100vh", display: "flex", flexDirection: "column" };
const mainStyle  = { flex: 1, display: "block" }; // keeps footer at bottom
const sectionStyle = { margin: "24px auto", maxWidth: 1200 };
const cardsStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
  gap: 24,
};
const emptyStyle = { padding: "48px 0", textAlign: "center", color: "#6b7280", fontSize: "1.1rem" };

const Listings = () => {
  const dispatch = useDispatch();
  const { properties = [] } = useSelector((s) => s.propertyList || {});

  useEffect(() => {
    dispatch(getPropertyList());
    window.scrollTo(0, 0);
  }, [dispatch]);

  return (
    <div style={pageStyle}>
      {/* Nav only — no hero/banner */}
      <HeaderContainer />

      <main style={mainStyle}>
        <Section style={sectionStyle}>
          <Section.InnerContainer>
            {/* Keep the title only; removed any extra “top thing” */}
            <Section.Title>All Properties</Section.Title>

            <Section.Content>
              {properties.length === 0 ? (
                <div style={emptyStyle}>No properties found.</div>
              ) : (
                <div style={cardsStyle}>
                  {properties.map((p) => (
                    
                    <ListingItemContainer key={p.id} featured={p} width="100%" />
                  ))}
                </div>
              )}
            </Section.Content>
          </Section.InnerContainer>
        </Section>
      </main>

      <FooterContainer />
    </div>
  );
};

export default Listings;
