import React from "react";
import { Main } from "./styles/banner";

// wrapper for your page “hero” area
const Banner = ({ children, bg, source, ...restProps }) => {
  return (
    <Main {...restProps} bg={bg} source={source}>
      {children}
    </Main>
  );
};

export default Banner;
