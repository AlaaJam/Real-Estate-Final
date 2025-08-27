// containers/ContactAgentContainer.jsx
import React from "react";
import { Property } from "../components";

/**
 * Ensure we pass only a filename to <Property.AgentImage />,
 * because that component builds /images/agents/${source}.
 */
const normalizeAgentImage = (img) => {
  if (!img) return "agent1.jpg";
  const name = String(img).split("/").pop();
  return name || "agent1.jpg";
};

const ContactAgentContainer = ({ property }) => {
  // Fallback agent so the card always renders safely.
  const agent = property?.agent || {
    name: "Our Agent",
    image: "agent1.jpg",
    phone: "+962-79-0000000",
    email: "agent@example.com",
  };

  const photo = normalizeAgentImage(agent.image);
  const name = agent.name || "Our Agent";
  const phone = agent.phone || "—";
  const email = agent.email || "—";

  // Optional: hide entirely if you prefer when there is no real agent
  // if (!property?.agent) return null;

  return (
    <Property.Contact>
      <Property.ContactHeader>
        <Property.Title>Contact Agent</Property.Title>
      </Property.ContactHeader>

      <Property.ContactContent>
        <Property.AgentImage source={photo} />
        <Property.Subtitle style={{ marginTop: 8 }}>{name}</Property.Subtitle>

        <Property.ContactList>
          <Property.ContactItem>
            <Property.Text>
              📞{" "}
              {phone !== "—" ? (
                <a
                  href={`tel:${phone}`}
                  style={{ color: "inherit", textDecoration: "none" }}
                >
                  {phone}
                </a>
              ) : (
                "—"
              )}
            </Property.Text>
          </Property.ContactItem>

          <Property.ContactItem>
            <Property.Text>
              ✉️{" "}
              {email !== "—" ? (
                <a
                  href={`mailto:${email}`}
                  style={{ color: "inherit", textDecoration: "none" }}
                >
                  {email}
                </a>
              ) : (
                "—"
              )}
            </Property.Text>
          </Property.ContactItem>
        </Property.ContactList>
      </Property.ContactContent>
    </Property.Contact>
  );
};

export default ContactAgentContainer;
