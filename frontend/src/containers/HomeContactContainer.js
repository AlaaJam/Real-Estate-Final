import React, { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components/macro";
import { Section } from "../components";

/* --- Full-bleed (no side white space) --- */
const FullBleed = styled(Section.InnerContainer)`
  width: 100%;
  max-width: none;
  padding: clamp(48px, 8vw, 96px) clamp(16px, 3vw, 32px);
`;

/* --- Hero row --- */
const Hero = styled.div`
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: clamp(24px, 4vw, 48px);
  align-items: center;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

const Copy = styled.div``;

const Eyebrow = styled.p`
  font-weight: 700;
  letter-spacing: .06em;
  text-transform: uppercase;
  color: var(--bs-primary, #2563eb);
  margin: 0 0 6px;
`;

const Title = styled.h2`
  margin: 0 0 10px;
  font-size: clamp(28px, 4vw, 42px);
  line-height: 1.15;
  color: var(--bs-gray-900, #111);
`;

const Lead = styled.p`
  margin: 10px 0 18px;
  max-width: 65ch;
  font-size: 1.1rem;
  line-height: 1.7;
  color: var(--bs-gray-700, #4b5563);
`;

/* --- Highlights (chips) --- */
const Highlights = styled.ul`
  list-style: none;
  padding: 0;
  margin: 12px 0 0;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;
const Chip = styled.li`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 999px;
  background: #fff;
  border: 1px solid rgba(0,0,0,.08);
  color: var(--bs-gray-900, #111);
  font-weight: 600;
  font-size: .95rem;
`;

/* --- Panel animations --- */
const bgShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const floaty = keyframes`
  0%,100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(37,99,235,.45); }
  70% { box-shadow: 0 0 0 16px rgba(37,99,235,0); }
  100% { box-shadow: 0 0 0 0 rgba(37,99,235,0); }
`;

const scroll = keyframes`
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
`;

const shine = keyframes`
  to { background-position: 200% center; }
`;

/* --- Animated Panel --- */
const Panel = styled.div`
  position: relative;
  height: clamp(280px, 34vw, 440px);
  border-radius: 20px;
  background: linear-gradient(115deg,#eef2ff, #f0fdfa, #fff1f2);
  background-size: 200% 200%;
  animation: ${bgShift} 14s ease-in-out infinite;
  box-shadow: 0 20px 40px rgba(0,0,0,.08);
  border: 1px solid rgba(0,0,0,.06);
  overflow: hidden;
  padding: clamp(14px, 2vw, 18px);
`;

/* grid overlay for subtle “map” feel */
const GridOverlay = styled.div`
  position: absolute; inset: 0;
  background-image:
    linear-gradient(to right, rgba(0,0,0,.04) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(0,0,0,.04) 1px, transparent 1px);
  background-size: 36px 36px;
  mask-image: radial-gradient(80% 80% at 70% 30%, #000 70%, transparent 100%);
  pointer-events: none;
`;

const PanelInner = styled.div`
  position: relative;
  z-index: 1;
  height: 100%;
  display: grid;
  grid-template-rows: auto 1fr auto;
  gap: 12px;
`;

/* rotating headline */
const RotatorLine = styled.div`
  font-weight: 700;
  font-size: clamp(16px, 1.2vw, 18px);
  letter-spacing: .01em;
  color: var(--bs-gray-900, #111);
  background: linear-gradient(90deg, #111, #2563eb, #16a34a, #111);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  background-size: 200% auto;
  animation: ${shine} 8s linear infinite;
`;

/* marquee */
const Marquee = styled.div`
  overflow: hidden;
  border-radius: 12px;
  background: rgba(255,255,255,.75);
  border: 1px solid rgba(0,0,0,.06);
  -webkit-mask-image: linear-gradient(to right, transparent, #000 12%, #000 88%, transparent);
          mask-image: linear-gradient(to right, transparent, #000 12%, #000 88%, transparent);
`;
const Track = styled.div`
  display: inline-flex;
  gap: 18px;
  padding: 10px 14px;
  white-space: nowrap;
  animation: ${scroll} 22s linear infinite;
`;
const Tag = styled.span`
  padding: 6px 10px;
  border-radius: 999px;
  background: #fff;
  border: 1px solid rgba(0,0,0,.06);
  font-weight: 600;
  font-size: .9rem;
  color: var(--bs-gray-800, #1f2937);
  animation: ${floaty} 6s ease-in-out infinite;
  animation-delay: ${p => p.$delay || "0s"};
`;

/* pins */
const Pins = styled.div`position: absolute; inset: 0; pointer-events: none;`;
const Pin = styled.span`
  position: absolute;
  left: ${p => p.$left}%;
  top: ${p => p.$top}%;
  width: 10px; height: 10px;
  background: #2563eb; border-radius: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 0 0 rgba(37,99,235,.45);
  animation: ${pulse} ${p => p.$dur || 3}s ease-out infinite;

  &::after{
    content:"";
    position:absolute; left:50%; top:100%;
    width: 2px; height: 8px; border-radius: 2px;
    background: rgba(37,99,235,.45);
    transform: translateX(-50%);
  }
`;

/* --- Feature cards below (reused styles) --- */
const Grid = styled.div`
  margin-top: clamp(28px, 4vw, 44px);
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 18px;
`;
const Card = styled.div`
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 10px 24px rgba(0,0,0,.06);
  border: 1px solid rgba(0,0,0,.05);
  padding: 22px 22px 20px;
  transition: transform .15s ease, box-shadow .15s ease;
  &:hover { transform: translateY(-2px); box-shadow: 0 18px 36px rgba(0,0,0,.08); }

  h3 { margin: 0 0 8px; font-size: 1.15rem; font-weight: 700; color: var(--bs-gray-900, #111); }
  p  { margin: 0; color: var(--bs-gray-700, #4b5563); line-height: 1.65; }
`;

/* --- React roatator text --- */
const phrases = [
  "Fresh listings added hourly across 20+ cities.",
  "Verified homes with transparent prices & fees.",
  "Search by price, beds, amenities — then explore on the map.",
  "Neighborhood insights: schools, services, commute, and more."
];

const HomeContactContainer = () => {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % phrases.length), 2400);
    return () => clearInterval(id);
  }, []);

  return (
    <Section bgColor="--bs-fade-blue">
      <FullBleed>
        <Hero>
          {/* Left copy */}
          <Copy>
            <Eyebrow>About the platform</Eyebrow>
            <Title>Everything you need to find your next home</Title>
            <Lead>
              Real Home simplifies buying, renting, and listing properties with verified
              data, rich neighborhood details, and a modern, map-first experience. Built for speed,
              clarity, and trust across the MENA region.
            </Lead>

            <Highlights>
              <Chip>✅ Verified listings</Chip>
              <Chip>🔎 Smart filters</Chip>
              <Chip>🗺️ Real-time map view</Chip>
              <Chip>🏷️ Transparent pricing & fees</Chip>
              <Chip>⭐ Save & compare</Chip>
              <Chip>🌙 Light & dark themes</Chip>
            </Highlights>
          </Copy>

          {/* Right animated panel */}
          <Panel aria-label="Real Home live highlights">
            <PanelInner>
              <RotatorLine key={idx}>{phrases[idx]}</RotatorLine>

              <Marquee>
                <Track>
                  {/* repeat tags twice for seamless loop */}
                  <Tag $delay=".0s">Amman</Tag>
                  <Tag $delay=".2s">Irbid</Tag>
                  <Tag $delay=".4s">Zarqa</Tag>
                  <Tag $delay=".6s">Aqaba</Tag>
                  <Tag $delay=".8s">Madaba</Tag>
                  <Tag $delay="1.0s">Jerash</Tag>
                  <Tag $delay="1.2s">Mafraq</Tag>
                  <Tag $delay="1.4s">Karak</Tag>

                  <Tag $delay=".0s">Amman</Tag>
                  <Tag $delay=".2s">Irbid</Tag>
                  <Tag $delay=".4s">Zarqa</Tag>
                  <Tag $delay=".6s">Aqaba</Tag>
                  <Tag $delay=".8s">Madaba</Tag>
                  <Tag $delay="1.0s">Jerash</Tag>
                  <Tag $delay="1.2s">Mafraq</Tag>
                  <Tag $delay="1.4s">Karak</Tag>
                </Track>
              </Marquee>

              {/* spacer to bottom */}
              <div />
            </PanelInner>

            {/* floating pins for a subtle “map” vibe */}
            <Pins>
              <Pin $left={22} $top={28} $dur={3.2} />
              <Pin $left={48} $top={18} $dur={2.8} />
              <Pin $left={72} $top={34} $dur={3.6} />
              <Pin $left={30} $top={66} $dur={3.0} />
              <Pin $left={58} $top={72} $dur={3.4} />
              <Pin $left={83} $top={58} $dur={2.6} />
            </Pins>

            <GridOverlay />
          </Panel>
        </Hero>

        {/* Info cards below */}
        <Grid>
          <Card>
            <h3>Accurate, Fresh Data</h3>
            <p>Listings are validated and refreshed frequently to keep prices, availability, and photos up to date.</p>
          </Card>
          <Card>
            <h3>Powerful Search</h3>
            <p>Filter by city, price, bedrooms, amenities, and more—then explore results on an interactive map.</p>
          </Card>
          <Card>
            <h3>Neighborhood Insights</h3>
            <p>Understand commute times, nearby schools, services, and community vibes before you visit.</p>
          </Card>
          <Card>
            <h3>Saved Collections</h3>
            <p>Organize favorites into lists, add notes, and compare options side-by-side to decide confidently.</p>
          </Card>
          <Card>
            <h3>Clear Costs</h3>
            <p>Breakdowns for rent/sale price, deposits, utilities, and expected monthly totals—no surprises.</p>
          </Card>
          <Card>
            <h3>Privacy & Security</h3>
            <p>Modern authentication and secure data handling keep your account and personal info protected.</p>
          </Card>
        </Grid>
      </FullBleed>
    </Section>
  );
};

export default HomeContactContainer;
