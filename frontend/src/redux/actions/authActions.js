import { api } from "../../helpers/api";

// redux/actions/authActions.js
export const signup = (name, email, password) => async (dispatch) => {
  try {
    const res = await fetch("http://localhost:5000/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (data.success) {
      alert(data.message); // ✅ show success
    } else {
      alert(data.message); // ❌ show failure
    }

    return data;
  } catch (err) {
    alert("❌ Signup failed");
    throw err;
  }
};

// Login
export const login = (email, password) => async (dispatch) => {
  const { user } = await api("/auth/login", { method: "POST", body: { email, password } });
  dispatch({ type: "AUTH/SET_USER", payload: user });
};

// Restore session
export const fetchMe = () => async (dispatch) => {
  const { user } = await api("/auth/me");
  dispatch({ type: "AUTH/SET_USER", payload: user });
};

// Logout
export const logout = () => async (dispatch) => {
  try {
    await api("/auth/logout", { method: "POST" }); // hits backend now
  } catch (e) {
    console.warn("Logout API failed:", e.message);
  }
  localStorage.removeItem("user");
  dispatch({ type: "AUTH/SET_USER", payload: null });
};