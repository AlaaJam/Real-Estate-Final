import React, { Fragment, useState } from "react";
import { HeaderContainer, FooterContainer } from "../containers";
import { Login as LoginBlock, Form } from "../components";

import { useHistory } from "react-router-dom";   // ✅ v5 uses useHistory

const LoginPage = () => {
  const history = useHistory();   // ✅ correct hook
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const res = await fetch("http://localhost:7542/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

      alert(data.message);
      // ✅ now data.user exists
      localStorage.setItem("user", JSON.stringify(data.user));
      history.push("/");

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Fragment>
      <HeaderContainer bg="false" />
      <LoginBlock>
        <LoginBlock.Container>
          <LoginBlock.Content>
            <LoginBlock.Header>
              <LoginBlock.Title>Login</LoginBlock.Title>
            </LoginBlock.Header>

            <LoginBlock.InnerContent>
              <Form onSubmit={onSubmit}>
                <Form.FormGroup>
                  <Form.Label>Email</Form.Label>
                  <Form.Input
                    name="email"
                    value={form.email}
                    onChange={onChange}
                    placeholder="you@example.com"
                  />
                </Form.FormGroup>

                <Form.FormGroup>
                  <Form.Label>Password</Form.Label>
                  <Form.Input
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={onChange}
                  />
                </Form.FormGroup>

                {error && <p style={{ color: "crimson" }}>{error}</p>}

                <Form.FormGroup>
                  <Form.SubmitInput type="submit" value="Login" />
                </Form.FormGroup>
              </Form>
            </LoginBlock.InnerContent>

            <LoginBlock.Footer>
              <LoginBlock.Text>
                <LoginBlock.Anchor to="/forgot-password">Forgot Password?</LoginBlock.Anchor>
              </LoginBlock.Text>
              <LoginBlock.Text>
                Don’t have an account?{" "}
                <LoginBlock.Anchor to="/signup">Sign Up</LoginBlock.Anchor>
              </LoginBlock.Text>
            </LoginBlock.Footer>
          </LoginBlock.Content>
        </LoginBlock.Container>
      </LoginBlock>
      <FooterContainer />
    </Fragment>
  );
};

export default LoginPage;