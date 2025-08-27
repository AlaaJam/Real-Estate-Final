import styled from "styled-components/macro";

export const Main = styled.div`

   position: relative;
  min-height: 70vh;
  display: grid;
  place-items: center;
  background: ${({ source }) =>
    source
      ? `url(${source}) center/cover no-repeat`
      : `linear-gradient(135deg, #e6f0ff 0%, #ffffff 100%)`};
  background-size: cover;
  background-position: center;
  background-repeat: none;
  background-attachment: fixed;
  /* Disable fixed attachment on mobile for performance */
  @media (max-width: 768px) {
    background-attachment: scroll;
  }

  /* gradient overlay for text contrast */
  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      180deg,
      rgba(0,0,0,0.55) 0%,
      rgba(0,0,0,0.25) 40%,
     rgba(0,0,0,0.35) 100%
    );
    pointer-events: none;
  }
`;