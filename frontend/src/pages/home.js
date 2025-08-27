import React from "react";
import {
  HeaderContainer,
  // FeaturedListingContainer,
  // FeaturedAgentsContainer,
  HomeContactContainer,
  FooterContainer,
} from "../containers";

const Home = () => {
  return (
    <>
      <HeaderContainer bg="true" source="/images/banners/banner4.jpg" />

      <HomeContactContainer />
      <FooterContainer />
    </>
  );
};

export default Home;