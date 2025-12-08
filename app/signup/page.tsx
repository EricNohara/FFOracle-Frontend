"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PrimaryColorButton, PrimaryColorOutlinedButton } from "../components/Buttons";
import styled from "styled-components";
import { titleFont, headerFont } from "../localFont";
import TextInput from "../components/TextInput";
import Image from "next/image";
import TitleLogo from "../components/TitleLogo";
import { useRedirectIfLoggedIn } from "../hooks/useRedirectIfLoggedIn";
import CheckboxInput from "../components/CheckboxInput";

// Main layout with split panel
const Container = styled.div`
  display: grid;
  grid-template-columns: 40% 60%;
  height: 100vh;
  width: 100vw;
  position: relative;
`;

// Left panel holds the form
const LeftPanel = styled.div`
  position: relative;
  z-index: 2;
  background-color: var(--color-base-dark);
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 0 var(--global-border-radius) var(--global-border-radius) 0;
  margin-right: -20px;
`;

// Left panel content wrapper
const LeftPanelContent = styled.div`
  height: 100%;
  width: 75%;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

// Right panel holds graphic + logo
const RightPanel = styled.div`
  position: relative;
  z-index: 1;
  overflow: hidden;
`;

const BackgroundImage = styled(Image)`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  object-fit: cover;
  object-position: right center;
  z-index: 0;
`;

const TitleLogoWrapper = styled.div`
  position: absolute;
  top: 2rem;
  right: 3rem;
  z-index: 3;
`;

// Section headers
const FormTitle = styled.h1`
  color: white;
  margin: 0;
  font-size: 2.25rem;
`;

const FormSubtitle = styled.h3`
  color: var(--color-txt-secondary);
  font-size: 0.8rem;
  margin-top: 0.5rem;
  margin-bottom: 2rem;
`;

// Form container
const LoginForm = styled.form`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0rem;
`;

// Divider for footer section
const DividerContainer = styled.div`
  margin-top: 1rem;
  display: flex;
  gap: 2rem;
  width: 100%;
  align-items: center;

  & > p {
    color: var(--color-txt-3) !important;
    font-size: 0.8rem;
  }
`;

const Divider = styled.div`
  height: 2px;
  width: 100%;
  background-color: var(--color-txt-3);
  border-radius: var(--global-border-radius);
`;

// Footer with sign-in link and forgot password
const OtherContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  width: 100%;
  color: var(--color-txt-3);
  font-size: 0.8rem;

  p {
    margin: 0;
  }

  a {
    text-decoration: none;
    color: var(--color-blue-1);
    font-size: 0.8rem;
  }

  a:hover {
    text-decoration: underline;
  }
`;

const FormFooterContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-top: 1rem;
  gap: 1rem;
`;

export default function SignUpPage() {
  // Redirect user away from signup if already authenticated
  useRedirectIfLoggedIn();

  const router = useRouter();

  // Controlled form fields
  const [fullname, setFullname] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [allowEmails, setAllowEmails] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Simple loading state
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Handle submit and send request to backend signup endpoint
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/Users/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          password,
          fullname: fullname || null,
          phone_number: phoneNumber || null,
          allow_emails: allowEmails
        })
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to sign up");
      }

      const data = await res.json();
      alert(data.message);

      // Navigate to sign-in after successful registration
      router.push("/signin");
    } catch (err) {
      alert(err);

      // Reset fields after error
      setFullname("");
      setPhoneNumber("");
      setAllowEmails(true);
      setEmail("");
      setPassword("");
      setIsLoading(false);
    }
  };

  return (
    <Container>
      {/* LEFT PANEL (signup form) */}
      <LeftPanel>
        <LeftPanelContent>
          <FormTitle className={titleFont.className}>
            Effortlessly manage your fantasy football team
          </FormTitle>

          <FormSubtitle className={headerFont.className}>
            Sign up now completely free
          </FormSubtitle>

          <LoginForm onSubmit={handleSignUp}>
            {/* Email */}
            <TextInput
              label="Email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              compact
            />

            {/* Password */}
            <TextInput
              label="Password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              type="password"
              required
              compact
            />

            {/* Full name (optional) */}
            <TextInput
              label="Full Name"
              name="fullname"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              placeholder="Enter your full name"
              compact
            />

            {/* Phone number (optional) */}
            <TextInput
              label="Phone Number"
              name="phoneNumber"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Enter your phone number"
              compact
            />

            {/* Email preference */}
            <CheckboxInput
              checked={allowEmails}
              onChange={setAllowEmails}
              label="Allow FFOracle to send article emails about your players"
            />

            {/* Submit */}
            <PrimaryColorButton
              type="submit"
              disabled={isLoading}
              isFullWidth
              style={{ marginTop: "1rem" }}
            >
              Sign Up
            </PrimaryColorButton>
          </LoginForm>

          {/* FOOTER SECTION */}
          <FormFooterContainer>
            <DividerContainer>
              <Divider />
              <p className={headerFont.className}>Other</p>
              <Divider />
            </DividerContainer>

            <OtherContent>
              <p>Already have an account?</p>

              <PrimaryColorOutlinedButton onClick={() => router.push("/signin")} isFullWidth>
                Sign In
              </PrimaryColorOutlinedButton>

              <a href="/user/password/forgot">Forgot password?</a>
            </OtherContent>
          </FormFooterContainer>
        </LeftPanelContent>
      </LeftPanel>

      {/* RIGHT PANEL (background + logo) */}
      <RightPanel>
        <BackgroundImage
          src="/images/sign-in-sign-up-bg.jpg"
          alt="Login Signup Graphic"
          fill
          priority
        />
        <TitleLogoWrapper>
          <TitleLogo />
        </TitleLogoWrapper>
      </RightPanel>
    </Container>
  );
}
