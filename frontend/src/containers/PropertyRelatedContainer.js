import React from "react";
import { Property } from "../components";

const PropertyRelatedContainer = ({ featured }) => {
  return (
    <Property.Featured>
      <Property.FeaturedHeader>
        <Property.Title>Featured Properties</Property.Title>
      </Property.FeaturedHeader>
      <Property.FeaturedContent>
        {featured.map((property) => (
          <FeaturedItem key={property.id} property={property} />
        ))}
      </Property.FeaturedContent>
    </Property.Featured>
  );
};
const FeaturedItem = ({ property }) => {
  const firstImg = property.images?.[1] || property.images?.[0] || "image2.jpg";
  const addr = property.address?.address || property.location || "Unknown";

  return (
    <Property.FeaturedItem>
      <Property.ItemLeft>
        <Property.Image source={firstImg} />
      </Property.ItemLeft>
      <Property.ItemRight>
        <Property.Subtitle>
          <Property.Anchor to={`/property/${property.id}`}>
            {property.title}
          </Property.Anchor>
        </Property.Subtitle>
        <Property.Text>
          <Property.Icon name="fas fa-map-marker-alt" /> {addr}
        </Property.Text>
        <Property.FeaturedInfo>
          <Property.Text>{property.type === "rental" ? "Rent" : "Sale"}</Property.Text>
          <Property.Text>JOD {property.price}</Property.Text>
        </Property.FeaturedInfo>
      </Property.ItemRight>
    </Property.FeaturedItem>
  );
};


export default PropertyRelatedContainer;
