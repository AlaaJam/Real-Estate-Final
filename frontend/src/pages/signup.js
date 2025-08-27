import React, { Fragment, useState } from "react";

import { HeaderContainer, FooterContainer } from "../containers";
import { Signup as SignupBlock, Form } from "../components";


// If you use react-router v5 history prop, you can redirect after success

const SignupPage = () => {

  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState(null);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirm) {
      setError("Passwords do not match");
      return;
    }

    try {
      const res = await fetch("http://localhost:7542/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
        }),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const data = await res.json();
      alert(data.message); // ✅ success / error from backend
    } catch (err) {
      setError(err.message);
    }
  };




  return (
    <Fragment>
      <HeaderContainer bg={false} />
      <SignupBlock>
        <SignupBlock.Container>
          <SignupBlock.Content>
            <SignupBlock.Header>
              <SignupBlock.Title>Signup</SignupBlock.Title>
            </SignupBlock.Header>

            <SignupBlock.InnerContent>
              <Form as="form" onSubmit={onSubmit}>

                <Form.FormGroup>
                  <Form.Label>Name</Form.Label>
                  <Form.Input name="name" value={form.name} onChange={onChange} placeholder="Your name" />
                </Form.FormGroup>

                <Form.FormGroup>
                  <Form.Label>Email</Form.Label>
                  <Form.Input name="email" value={form.email} onChange={onChange} placeholder="you@example.com" />
                </Form.FormGroup>

                <Form.FormGroup>
                  <Form.Label>Password</Form.Label>
                  <Form.Input name="password" type="password" value={form.password} onChange={onChange} />
                </Form.FormGroup>

                <Form.FormGroup>
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Input name="confirm" type="password" value={form.confirm} onChange={onChange} />
                </Form.FormGroup>

                {error && <p style={{ color: "crimson" }}>{error}</p>}

                <Form.FormGroup>
                  {/* If Form.SubmitInput doesn’t call onSubmit, use <button type="submit"> */}
                  <Form.SubmitInput type="submit" value="Signup" />
                </Form.FormGroup>
              </Form>
            </SignupBlock.InnerContent>

            <SignupBlock.Footer>
              <SignupBlock.Text>
                Already have an account? <SignupBlock.Anchor to="/login">Login</SignupBlock.Anchor>
              </SignupBlock.Text>
            </SignupBlock.Footer>
          </SignupBlock.Content>
        </SignupBlock.Container>
      </SignupBlock>
      <FooterContainer />
    </Fragment>
  );
};

export default SignupPage;
