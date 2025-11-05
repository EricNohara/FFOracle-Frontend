"use client"

import styled from "styled-components"
import Image from "next/image"
import { PrimaryColorButton, PrimaryColorOutlinedButton } from "../Buttons"
import { useRouter } from "next/navigation"

const NavBar = styled.nav`
    width: 100%;
    height: 100px;
    background-color: var(--color-base-dark);
    color: white;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 2rem;
`;

const ButtonContainer = styled.div`
    display: flex;
    gap: 2rem;
`;

const LogoContainer = styled.div`
    height: 75px;
    width: 200px;
    position: relative;
`;

export default function LandingNav() {
    const router = useRouter();

    return (
        <NavBar>
            <LogoContainer>
                <Image
                    src="/images/logo.png"
                    fill
                    style={{ objectFit: "contain" }}
                    alt="FFOracle landing page background"
                />
            </LogoContainer>
            <ButtonContainer>
                <PrimaryColorOutlinedButton onClick={() => router.push("/signin")}>Sign In</PrimaryColorOutlinedButton>
                <PrimaryColorButton onClick={() => router.push("/signup")}>Sign Up</PrimaryColorButton>
            </ButtonContainer>
        </NavBar>
    );
}