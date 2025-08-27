import React from "react";
import {
  Container,
  Top,
  Bottom,
  Image as StyledImage,
  Anchor,
  Text,
  Title,
  ImageContainer,
  PriceText,
  TopItem,
  TopItemContainer,
  TopItemInfo,
  BottomItem,
  ListingAgent,
  ListingAgentImage,
  ListingAgentName,
  LisitngButton,
} from "./styles/listing";

/** Helper: currency formatting (اختياري، يستخدم لو مررتِ amount) */
const fmtCurrency = (n, { currency = "JOD", locale = "en-US" } = {}) => {
  if (typeof n !== "number") return n;
  return `${currency} ${n.toLocaleString(locale)}`;
};

const Listing = ({ children, width, ...restProps }) => {
  // ملاحظة: width صار غير ضروري لو بتستخدمي CSS Grid، لكن أتركناه للتوافق
  return (
    <Container {...restProps} width={width}>
      {children}
    </Container>
  );
};

Listing.Text = ({ children, ...restProps }) => <Text {...restProps}>{children}</Text>;
Listing.Top = ({ children, ...restProps }) => <Top {...restProps}>{children}</Top>;
Listing.Bottom = ({ children, ...restProps }) => <Bottom {...restProps}>{children}</Bottom>;
Listing.Title = ({ children, ...restProps }) => <Title {...restProps}>{children}</Title>;
Listing.TopItem = ({ children, ...restProps }) => <TopItem {...restProps}>{children}</TopItem>;
Listing.BottomItem = ({ children, ...restProps }) => <BottomItem {...restProps}>{children}</BottomItem>;
Listing.Anchor = ({ children, to = "#", ...restProps }) => (
  <Anchor to={to} {...restProps}>{children}</Anchor>
);

Listing.Image = ({ source, alt, ...restProps }) => {
  const first = Array.isArray(source) ? source[0] : source;
  const isAbsolute =
    typeof first === "string" &&
    (first.startsWith("http://") || first.startsWith("https://") || first.startsWith("/"));
  const src = isAbsolute ? first : `/images/houses/${first || "placeholder.jpg"}`;

  const onError = (e) => {
    // امنعي حلقة onError: استعملي data-flag
    if (e.currentTarget.dataset.fallback !== "1") {
      e.currentTarget.dataset.fallback = "1";
      e.currentTarget.src = "/images/placeholder.jpg";
    }
  };

  return (
    <StyledImage
      src={src}
      alt={alt || "Property photo"}
      loading="lazy"
      decoding="async"
      draggable={false}
      onError={onError}
      {...restProps}
    />
  );
};

Listing.ImageContainer = ({ children, ...restProps }) => (
  <ImageContainer {...restProps}>{children}</ImageContainer>
);

/** يدعم شكلين:
 *  1) <Listing.Price>JOD 120,000</Listing.Price>  (قديم – يشتغل كالعادة)
 *  2) <Listing.Price amount={120000} currency="JOD" /> (جديد – ينسّق تلقائيًا)
 */
Listing.Price = ({ children, amount, currency = "JOD", locale = "en-US", ...restProps }) => {
  const content = typeof amount === "number" ? fmtCurrency(amount, { currency, locale }) : children;
  return <PriceText {...restProps}>{content}</PriceText>;
};

Listing.TopItemInfo = ({ children, ...restProps }) => <TopItemInfo {...restProps}>{children}</TopItemInfo>;
Listing.AgentName = ({ children, ...restProps }) => <ListingAgentName {...restProps}>{children}</ListingAgentName>;
Listing.AgentContainer = ({ children, ...restProps }) => <ListingAgent {...restProps}>{children}</ListingAgent>;
Listing.AgentImageContainer = ({ children, ...restProps }) => (
  <ListingAgentImage {...restProps}>{children}</ListingAgentImage>
);

/** زر يدعم تمريل "to" مباشرةً (اختياري)، أو استخدميه كما كان مع Anchor داخله */
Listing.Button = ({ children, to, ...restProps }) => {
  if (to) {
    return (
      <LisitngButton {...restProps}>
        <Anchor to={to}>{children}</Anchor>
      </LisitngButton>
    );
  }
  return <LisitngButton {...restProps}>{children}</LisitngButton>;
};

Listing.TopItemContainer = ({ children, ...restProps }) => (
  <TopItemContainer {...restProps}>{children}</TopItemContainer>
);

Listing.Icon = () => (
  <i className="fas fa-map-marker-alt" aria-hidden="true" style={{ color: "white" }}></i>
);

export default Listing;
