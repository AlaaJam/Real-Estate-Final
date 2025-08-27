import React, { useEffect, useState } from "react";
import { Route, Redirect } from "react-router-dom";

const API_BASE = process.env.REACT_APP_API_BASE || "";

function getUserFromStorage() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function AdminRoute({ component: Component, ...rest }) {
  const [state, setState] = useState("loading");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const lsUser = getUserFromStorage();
      if (lsUser?.email === "admin@gmail.com") {
        if (!cancelled) setState("allow");
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/api/auth/me`, { credentials: "include" });
        if (res.ok) {
          const u = await res.json();
          if (!cancelled) setState(u?.email === "admin@gmail.com" ? "allow" : "deny");
        } else {
          if (!cancelled) setState("deny");
        }
      } catch {
        if (!cancelled) setState("deny");
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <Route
      {...rest}
      render={(props) =>
        state === "loading" ? null :
        state === "allow"   ? <Component {...props} /> :
                              <Redirect to="/" />
      }
    />
  );
}
