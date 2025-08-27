import React, { useEffect } from "react";
import styled from "styled-components/macro";
import { useDispatch, useSelector } from "react-redux";
import {
  HeaderContainer,
  ListingItemContainer,
  FooterContainer,
} from "../containers";
import { Section } from "../components";
import { getPropertyList } from "../redux/actions/propertiesAction";

/* Full-bleed version of Section.InnerContainer */
const FullBleed = styled(Section.InnerContainer)`
  width: 100%;
  max-width: none;            /* remove the built-in container width */
  padding-left: clamp(12px, 2vw, 24px);
  padding-right: clamp(12px, 2vw, 24px);
`;

/* Stretch cards to fill the row */
const Cards = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
`;

const Listing = () => {
  const dispatch = useDispatch();
  const listProperties = useSelector((state) => state.propertyList);
  const properties = listProperties?.properties || [];

  useEffect(() => {
    dispatch(getPropertyList());
  }, [dispatch]);

  return (
    <>
      <HeaderContainer bg="false" />

      <Section bgColor="--bs-fade-info">
        <FullBleed>
          <Section.Title style={{ textAlign: "center" }}>
            Our Property List
          </Section.Title>

          <Cards>
            {properties.map((featured) => (
              <ListingItemContainer
                key={featured.id}
                featured={featured}
                width="100%"   /* let each card fill its grid cell */
              />
            ))}
          </Cards>

          <Section.Footer style={{ display: "flex", justifyContent: "center" }}>
            <Section.Button>More Listing</Section.Button>
          </Section.Footer>
        </FullBleed>
      </Section>

      <FooterContainer />
    </>
  );
};

export default Listing;
