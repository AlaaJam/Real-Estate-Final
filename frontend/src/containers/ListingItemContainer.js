import React from "react";

import { Listing } from "../components";


const ListingItemContainer = ({ featured, width }) => {

  console.log("featured ===> "+featured.imageUrl);
  
  if (!featured) return null;


  return (
    <Listing width={width}>
      <Listing.Top>
        <Listing.TopItem>
         <Listing.Image source={featured.imageUrl} alt={featured.title} />


          <Listing.TopItemContainer>
            <Listing.TopItemInfo>
              <Listing.Icon />
         <Listing.Text location>{featured.location || "Unknown"}</Listing.Text>

            </Listing.TopItemInfo>
          </Listing.TopItemContainer>
        </Listing.TopItem>
      </Listing.Top>
      <Listing.Bottom>
        <Listing.BottomItem>
          <Listing.Title>
            <Listing.Anchor to={`/property/${featured.id}`}>
              {featured.title || "No Title"}
            </Listing.Anchor>
          </Listing.Title>
          <Listing.Price>
            JOD {featured.price || "N/A"}
          </Listing.Price>
          <Listing.Text description>
            {(featured.description || "").substring(0, 100)}
          </Listing.Text>
          <Listing.Button>
            <Listing.Anchor to={`/property/${featured.id}`}>
              Details
            </Listing.Anchor>
          </Listing.Button>
          <Listing.AgentContainer />
        </Listing.BottomItem>
      </Listing.Bottom>
    </Listing>
  );
};

export default ListingItemContainer;