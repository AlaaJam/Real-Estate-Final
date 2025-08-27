import React, { useState } from "react";
import { Property } from "../components";


export const PropertGallery = ({ image = [] }) => {
  const pics = Array.isArray(image) ? image : [];
  const toShow = pics.length ? pics : ["image2.jpg","image6.jpg","image7.jpg","image8.jpg"];
  return (
    <Property.Gallery>
      {toShow.slice(0,4).map((img, i) => (
        <Property.ImageContainer key={i}>
          <Property.Image source={img} />
        </Property.ImageContainer>
      ))}
    </Property.Gallery>
  );
};

export const PropertyFeatures = ({ features = {} }) => {
  const {
    bedrooms = 0,
    garage = 0,
    status = 0,
    elevator = 0,
    kitchen = 0,
  } = features || {};

  const [shown, setShown] = useState(true);
  return (
    <Property.Info>
      <Property.InfoHeader onClick={() => setShown(s => !s)}>
        <Property.InfoTitle>Details and Features</Property.InfoTitle>
        <Property.Icon name={shown ? "fas fa-chevron-up" : "fas fa-chevron-down"} info />
      </Property.InfoHeader>
      <Property.InfoContent contentShown={shown}>
        <Property.InfoItem>
          <Property.Text><Property.Span>Bedrooms : </Property.Span>{bedrooms}</Property.Text>
          <Property.Text><Property.Span>Garage : </Property.Span>{garage}</Property.Text>
        </Property.InfoItem>
        <Property.InfoItem>
          <Property.Text><Property.Span>Status : </Property.Span>{status ? "Active" : "Not Active"}</Property.Text>
          <Property.Text><Property.Span>Elevator : </Property.Span>{elevator ? "Yes" : "No"}</Property.Text>
        </Property.InfoItem>
        <Property.InfoItem>
          <Property.Text><Property.Span>Kitchen : </Property.Span>{kitchen ? "Available" : "Not Available"}</Property.Text>
        </Property.InfoItem>
      </Property.InfoContent>
    </Property.Info>
  );
};


export const PropertyAmenities = ({ amenities = [] }) => {
  const list = Array.isArray(amenities) ? amenities : [];
  const [shown, setShown] = useState(true);

  return (
    <Property.Info>
      <Property.InfoHeader onClick={() => setShown(s => !s)}>
        <Property.InfoTitle>Amenities</Property.InfoTitle>
        <Property.Icon name={shown ? "fas fa-chevron-up" : "fas fa-chevron-down"} info />
      </Property.InfoHeader>
      <Property.InfoContent contentShown={shown}>
        {list.length ? (
          list.map(a => (
            <Property.InfoItem key={a}>
              <Property.Text>{a}</Property.Text>
            </Property.InfoItem>
          ))
        ) : (
          <Property.InfoItem><Property.Text>No amenities</Property.Text></Property.InfoItem>
        )}
      </Property.InfoContent>
    </Property.Info>
  );
};


export const PropertyAddress = ({ address = {} }) => {
  const a = address || {};
  const [shown, setShown] = useState(true);

  return (
    <Property.Info>
      <Property.InfoHeader onClick={() => setShown(s => !s)}>
        <Property.InfoTitle>Address</Property.InfoTitle>
        <Property.Icon name={shown ? "fas fa-chevron-up" : "fas fa-chevron-down"} info />
      </Property.InfoHeader>
      <Property.InfoContent contentShown={shown}>
        <Property.InfoItem>
          <Property.Text><Property.Span>Address : </Property.Span>{a.address || "—"}</Property.Text>
          <Property.Text><Property.Span>City : </Property.Span>{a.city || "—"}</Property.Text>
        </Property.InfoItem>
        <Property.InfoItem>
          <Property.Text><Property.Span>County/Sub-County : </Property.Span>{a.county || "—"}</Property.Text>
          <Property.Text><Property.Span>Street : </Property.Span>{a.street || "—"}</Property.Text>
        </Property.InfoItem>
        <Property.InfoItem>
          <Property.Text><Property.Span>Area : </Property.Span>{a.area || "—"}</Property.Text>
        </Property.InfoItem>
      </Property.InfoContent>
    </Property.Info>
  );
};




export const PropertyDescription = ({ description }) => {
 const [descriptionShown, setContentShown] = useState(true);


  const contentHandler = () => {
    setContentShown((previousState) => !previousState);
  };
  return (
    <Property.Info>
      <Property.InfoHeader onClick={contentHandler}>
        <Property.InfoTitle>Property Description</Property.InfoTitle>
        <Property.Icon
          name={descriptionShown ? "fas fa-chevron-up" : "fas fa-chevron-down"}
          info></Property.Icon>
      </Property.InfoHeader>
      <Property.InfoContent block="true" contentShown={descriptionShown}>
        <Property.Text>{description}</Property.Text>
      </Property.InfoContent>
    </Property.Info>
  );
};
