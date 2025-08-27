import React, { useEffect, useState, useCallback } from "react";
import { useLocation, useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";
import links from "../constants/routes/nav-links";
import { HeaderWrapper, Banner, Jumbotron } from "../components";
import { logout } from "../redux/actions/authActions";
import SideNavigationContainer from "./SideNavigationContainer";

const HeaderContainer = ({ bg, source }) => {
  const [isSideOpen, setIsSideOpen] = useState(false);
  const [fixed, setFixed] = useState(false);
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  });

  const location = useLocation();
  const history = useHistory();
  const dispatch = useDispatch();

  // Keep header "fixed" look after scrolling
  useEffect(() => {
    const onScroll = () => setFixed(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close side nav on route change
  useEffect(() => {
    setIsSideOpen(false);
  }, [location.pathname]);

  // Sync user if changed in another tab
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "user") {
        try {
          setUser(e.newValue ? JSON.parse(e.newValue) : null);
        } catch {
          setUser(null);
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const toggleSide = useCallback(() => setIsSideOpen((v) => !v), []);

  // Logout
  const handleLogout = async () => {
    try {
      await dispatch(logout());
    } finally {
      localStorage.removeItem("user");
      setUser(null);
      history.push("/login");
    }
  };

  // ---- Reusable header bar (used in both branches) ----
  const HeaderBar = (
    <HeaderWrapper bg={bg} fixed={fixed} role="navigation" aria-label="Primary">
      <HeaderWrapper.Container>
        <HeaderWrapper.Title bg={bg}>
          <HeaderWrapper.Link bg={bg} fixed={fixed} to="/">
            Real Home
          </HeaderWrapper.Link>
        </HeaderWrapper.Title>

        <HeaderWrapper.LinksContainer>
          {/* Main nav (hide Login if user exists) */}
          <HeaderWrapper.List links="links" role="menubar">
            {links
              .filter(
                (link) => !(user && (link.to === "/login" || /login/i.test(link.name)))
              )
              .map((link) => (
                <HeaderWrapper.Item key={link.to} role="none">
                  <HeaderWrapper.Anchor
                    role="menuitem"
                    bg={bg}
                    fixed={fixed}
                    to={link.to}
                  >
                    {link.name}
                  </HeaderWrapper.Anchor>
                </HeaderWrapper.Item>
              ))}
          </HeaderWrapper.List>

          {/* Right side: user + logout OR login */}
          <HeaderWrapper.List>
            <HeaderWrapper.Item>
              {user ? (
                <>
                  <HeaderWrapper.Anchor to="/profile" special="true">
                    {user.email}
                  </HeaderWrapper.Anchor>
                  <HeaderWrapper.Anchor
                    as="button"
                    onClick={handleLogout}
                    style={{ marginLeft: 10 }}
                  >
                    Logout
                  </HeaderWrapper.Anchor>
                </>
              ) : (
                <HeaderWrapper.Anchor to="/login" special="true">
                  Login
                </HeaderWrapper.Anchor>
              )}
            </HeaderWrapper.Item>
          </HeaderWrapper.List>

          {/* Burger menu */}
          <HeaderWrapper.List side="side">
            <HeaderWrapper.Item>
              <HeaderWrapper.Button
                aria-label="Open menu"
                aria-controls="mobile-menu"
                aria-expanded={isSideOpen}
                onClick={toggleSide}
              >
                <HeaderWrapper.Icon name="fa fa-bars" aria-hidden="true" />
              </HeaderWrapper.Button>
            </HeaderWrapper.Item>
          </HeaderWrapper.List>
        </HeaderWrapper.LinksContainer>
      </HeaderWrapper.Container>
    </HeaderWrapper>
  );
  // -----------------------------------------------------

  // Home page (bg === "true"): show banner + hero
  if (bg === "true") {
    return (
      <Banner bg={bg} source={source}>
        {HeaderBar}

        <Jumbotron>
          <Jumbotron.Left>
            <Jumbotron.Title>Find the home you deserve</Jumbotron.Title>
            <Jumbotron.Text>
              Browse curated listings and contact trusted agents.
            </Jumbotron.Text>
          </Jumbotron.Left>
        </Jumbotron>

        {isSideOpen && (
          <div className="overlay" onClick={toggleSide} aria-hidden="true" />
        )}

        <SideNavigationContainer
          sideNavShown={isSideOpen}
          sideNavHidden={!isSideOpen}
          setSideNavHidden={(v) => setIsSideOpen(!v)}
          setSideNavShown={setIsSideOpen}
        />
      </Banner>
    );
  }

  // All other pages: only the header bar (no banner/hero)
  return (
    <>
      {HeaderBar}

      {isSideOpen && (
        <div className="overlay" onClick={toggleSide} aria-hidden="true" />
      )}

      <SideNavigationContainer
        sideNavShown={isSideOpen}
        sideNavHidden={!isSideOpen}
        setSideNavHidden={(v) => setIsSideOpen(!v)}
        setSideNavShown={setIsSideOpen}
      />
    </>
  );
};

export default HeaderContainer;