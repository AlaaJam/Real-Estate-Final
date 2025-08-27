import React, { useEffect, useState } from "react";
import { Profile, Form } from "../components";
import { useHistory } from "react-router-dom";

const API_BASE = process.env.REACT_APP_API_BASE || ""; // "" uses CRA proxy

const ProfileContainer = () => {
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [ok, setOk] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address1: "",
    city: "",
    state: "",
  });

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  // Load current user profile
  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/api/users/me`, {
          method: "GET",
          credentials: "include",
        });
        if (res.status === 401) {
          // not logged in
          history.push("/login");
          return;
        }
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j.error || "Failed to load profile");
        }
        const data = await res.json();
        setForm({
          name: data.name ?? "",
          email: data.email ?? "",
          phone: data.phone ?? "",
          address1: data.address1 ?? "",
          city: data.city ?? "",
          state: data.state ?? "",
        });
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [history]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setOk(null);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/users/me`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          address1: form.address1,
          city: form.city,
          state: form.state,
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j.success) {
        throw new Error(j.error || "Failed to save");
      }
      setOk("Saved ✓");
      // update local copy from server
      if (j.user) {
        setForm((f) => ({
          ...f,
          name: j.user.name ?? f.name,
          phone: j.user.phone ?? f.phone,
          address1: j.user.address1 ?? f.address1,
          city: j.user.city ?? f.city,
          state: j.user.state ?? f.state,
        }));
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
      setTimeout(() => setOk(null), 2500);
    }
  };

  if (loading) {
    return (
      <Profile>
        <Profile.Bio>
          <p>Loading your profile…</p>
        </Profile.Bio>
      </Profile>
    );
  }

  return (
    <Profile>
      <Form onSubmit={onSubmit}>
        {/* Basic info */}
        <Profile.Bio>
          <Profile.Title>My Account</Profile.Title>

          {error && (
            <div style={{ margin: "8px 0", color: "crimson", fontWeight: 600 }}>
              {error}
            </div>
          )}
          {ok && (
            <div style={{ margin: "8px 0", color: "green", fontWeight: 600 }}>
              {ok}
            </div>
          )}

          <Form.FormGroup>
            <Form.Label>Name</Form.Label>
            <Form.Input
              name="name"
              value={form.name}
              onChange={onChange}
              placeholder="Your name"
              required
            />
          </Form.FormGroup>

          <Form.FormGroup>
            <Form.Label>Email</Form.Label>
            <Form.Input
              name="email"
              value={form.email}
              readOnly
              disabled
            />
            <Form.Span>Login email (read-only)</Form.Span>
          </Form.FormGroup>

          <Form.FormGroup>
            <Form.Label>Phone</Form.Label>
            <Form.Input
              name="phone"
              value={form.phone}
              onChange={onChange}
              placeholder="+962…"
            />
          </Form.FormGroup>

          <Form.FormGroup>
            <Form.Label>Address</Form.Label>
            <Form.Input
              name="address1"
              value={form.address1}
              onChange={onChange}
              placeholder="Street / Building"
            />
          </Form.FormGroup>

          <Form.FormGroup>
            <Form.Label>City</Form.Label>
            <Form.Input
              name="city"
              value={form.city}
              onChange={onChange}
              placeholder="City"
            />
          </Form.FormGroup>

          <Form.FormGroup>
            <Form.Label>State</Form.Label>
            <Form.Input
              name="state"
              value={form.state}
              onChange={onChange}
              placeholder="State"
            />
          </Form.FormGroup>

          <Form.FormGroup>
            <Form.SubmitInput value={saving ? "Saving..." : "Save Changes"} />
          </Form.FormGroup>
        </Profile.Bio>
      </Form>
    </Profile>
  );
};

export default ProfileContainer;