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

const Container = styled.div`
  display: grid;
  grid-template-columns: 40% 60%;
  height: 100vh;
  width: 100vw;
  position: relative;
`;

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

const LeftPanelContent = styled.div`
    height: 100%;
    width: 75%;
    display: flex;
    flex-direction: column;
    justify-content: center;
`;

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

const LoginForm = styled.form`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0rem;
`;

const DividerContainer = styled.div`
margin-top: 1rem;
  display: flex;
  gap: 2rem;
  width: 100%;
  align-items: center;

  &>p {
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
    // create browser client
    const supabase = createClient();
    const router = useRouter();
    const { setIsLoggedIn } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (password != passwordConfirm) throw new Error("Passwords do not match!");

            // call our backend to add the user

            // if (error) throw new Error(error.message);

            //  redirect user to dashboard page
            setIsLoggedIn(true);
            router.push("/dashboard");
        } catch (err) {
            const error = err as Error;
            alert(err);
            setEmail("");
            setPassword("");
            setIsLoading(false);
        }
    };

    return (
        <Container>
            {/* LEFT PANEL */}
            <LeftPanel>
                <LeftPanelContent>

                    <FormTitle className={titleFont.className}>Effortlessly manage your fantasy football team</FormTitle>
                    <FormSubtitle className={headerFont.className}>Sign up now completely free</FormSubtitle>

                    <LoginForm onSubmit={handleSignUp}>
                        <TextInput
                            label="Email"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                        />
                        <TextInput
                            label="Password"
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            type="password"
                            required
                        />
                        <TextInput
                            label="Confirm Password"
                            name="passwordConfirm"
                            value={passwordConfirm}
                            onChange={(e) => setPasswordConfirm(e.target.value)}
                            placeholder="Confirm your password"
                            type="password"
                            required
                        />
                        <PrimaryColorButton
                            type="submit"
                            disabled={isLoading}
                            isFullWidth
                            style={{ marginTop: "1rem" }}
                        >
                            Sign Up
                        </PrimaryColorButton>
                    </LoginForm>

                    {/* FOOTER */}
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

            {/* RIGHT PANEL */}
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
