"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "../context/AuthProvider";
import { PrimaryColorButton, PrimaryColorOutlinedButton } from "../components/Buttons";
import styled from "styled-components";
import { titleFont, headerFont } from "../localFont";
import TextInput from "../components/TextInput";
import Image from "next/image";
import TitleLogo from "../components/TitleLogo";
import { useRedirectIfLoggedIn } from "../hooks/useRedirectIfLoggedIn";
import { useUserData } from "../context/UserDataProvider";

// Layout container for both panels
const Container = styled.div`
  display: grid;
  grid-template-columns: 40% 60%;
  height: 100vh;
  width: 100vw;
  position: relative;
`;

// Left side login panel
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

// Wrapper for form layout on left panel
const LeftPanelContent = styled.div`
  height: 100%;
  width: 75%;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

// Background panel for the hero image
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

// Main form container
const LoginForm = styled.form`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0rem;
`;

// Divider for "Other" section
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

// Footer area under form
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

export default function SignInPage() {
  // Redirects user if they’re already authenticated
  useRedirectIfLoggedIn();

  // Supabase browser client
  const supabase = createClient();
  const router = useRouter();
  const { setIsLoggedIn } = useAuth();
  const { refreshUserData } = useUserData();

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Handles the sign-in process
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Authenticate with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw new Error(error.message);

      // On success, update auth context and redirect
      if (data.session) {
        setIsLoggedIn(true);
        refreshUserData();
        router.push("/dashboard");
      }
    } catch (err) {
      alert(err);
      setEmail("");
      setPassword("");
      setIsLoading(false);
    }
  };

  return (
    <Container>
      {/* LEFT PANEL (FORM SIDE) */}
      <LeftPanel>
        <LeftPanelContent>
          <FormTitle className={titleFont.className}>
            Welcome back to your fantasy football assistant
          </FormTitle>

          <FormSubtitle className={headerFont.className}>
            Sign in now to optimize your roster
          </FormSubtitle>

          <LoginForm onSubmit={handleSignIn}>
            {/* Email input */}
            <TextInput
              label="Email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />

            {/* Password input */}
            <TextInput
              label="Password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              type="password"
              required
            />

            {/* Submit button */}
            <PrimaryColorButton
              type="submit"
              disabled={isLoading}
              isFullWidth
              style={{ marginTop: "1rem" }}
            >
              Sign In
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
              <p>Don&apos;t have an account?</p>

              {/* Navigate to sign-up */}
              <PrimaryColorOutlinedButton
                onClick={() => router.push("/signup")}
                isFullWidth
              >
                Sign Up
              </PrimaryColorOutlinedButton>

              {/* Forgot password */}
              <a href="/user/password/forgot">Forgot password?</a>
            </OtherContent>
          </FormFooterContainer>
        </LeftPanelContent>
      </LeftPanel>

      {/* RIGHT PANEL (IMAGE + LOGO) */}
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
