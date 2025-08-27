import React, { useEffect, useState } from "react";
import { Dashboard } from "../components";
import { adminurls } from "../constants/routes/adminurls";

const API_BASE = process.env.REACT_APP_API_BASE || ""; // use CRA proxy or env

const DashboardContainer = ({ title, children, role }) => {
  const [show, setShow] = useState(false);
  const [pro, setPro] = useState(true);

  const [user, setUser] = useState(null);

  const handleDashboardNavigationOpen = () => {
    setShow(true);
    setPro(false);
  };

  const handleDashboardNavigationClose = () => {
    setShow(false);
    setPro(true);
  };

  // 🔐 Load current user (for the name)
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/users/me`, {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to load user");
        const data = await res.json();
        if (isMounted) setUser(data);
      } catch (e) {
        // Optionally handle error here
      }
    })();
    return () => (isMounted = false);
  }, []);

  const displayName = user?.name?.trim() || user?.email || "My Account";
  const roleLabel = role || (user?.role ? user.role : null); // optional

  return (
    <Dashboard>
      <Dashboard.Header>
        <Dashboard.Title>Dashboard</Dashboard.Title>
        <Dashboard.SideNav>
          <Dashboard.Button onClick={handleDashboardNavigationOpen}>
            <Dashboard.Icon name="fa fa-bars" />
          </Dashboard.Button>
        </Dashboard.SideNav>
      </Dashboard.Header>

      <Dashboard.Content>
        <Dashboard.Left show={show} pro={pro}>
          <Dashboard.Close>
            <Dashboard.Icon
              onClick={handleDashboardNavigationClose}
              name="fas fa-times"
            />
          </Dashboard.Close>

          {/* LEFT HEADER */}
          <Dashboard.LeftHeader>
            <Dashboard.Text>
              Welcome {displayName}{" "}
              {roleLabel ? <Dashboard.Span>({roleLabel})</Dashboard.Span> : null}
            </Dashboard.Text>
          </Dashboard.LeftHeader>

          <Dashboard.LeftContent>
            <Dashboard.List>
              {adminurls.map((item) =>
                item.subUrl ? (
                  <LinksWithSubLinks key={item.name} url={item} />
                ) : (
                  <Links key={item.name} url={item} />
                )
              )}
            </Dashboard.List>
          </Dashboard.LeftContent>
        </Dashboard.Left>

        <Dashboard.Right>
          <Dashboard.RightHeader>
            <Dashboard.Title>{title}</Dashboard.Title>
          </Dashboard.RightHeader>
          <Dashboard.RightContent>{children}</Dashboard.RightContent>
        </Dashboard.Right>
      </Dashboard.Content>
    </Dashboard>
  );
};

const LinksWithSubLinks = ({ url }) => {
  const [subLinksShown, setSublinksShown] = useState(false);
  const toggle = () => setSublinksShown((v) => !v);

  return (
    <Dashboard.ListItem>
      <Dashboard.Anchor to={url.url} onClick={toggle}>
        <Dashboard.Icon name={url.icon} />
        <Dashboard.Text>{url.name}</Dashboard.Text>
        <Dashboard.SublinkIcon name="fas fa-chevron-down" />
      </Dashboard.Anchor>

      {subLinksShown && (
        <Dashboard.SubList>
          {url.subUrls?.map((sub) => (
            <Links key={sub.name} url={sub} />
          ))}
        </Dashboard.SubList>
      )}
    </Dashboard.ListItem>
  );
};

const Links = ({ url }) => {
  return (
    <Dashboard.ListItem>
      <Dashboard.Anchor to={url.url}>
        <Dashboard.Icon name={url.icon} />
        <Dashboard.Text>{url.name}</Dashboard.Text>
      </Dashboard.Anchor>
    </Dashboard.ListItem>
  );
};

export default DashboardContainer;