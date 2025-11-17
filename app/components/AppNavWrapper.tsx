"use client";

import { ReactNode } from "react";
import Navigation from "./Navigation/Navigation";
import styled from "styled-components";
import { titleFont } from "../localFont";
import { useUserData } from "../context/UserDataProvider";
import LoadingSpinner from "./LoadingSpinner";

interface IAppNavWrapperProps {
  title: string;
  button1?: ReactNode;
  button2?: ReactNode;
  children: ReactNode;
}

const Wrapper = styled.div`
  display: flex;
  width: 100vw;
  height: 100vh;
`;

const RightPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 4rem;
  background-color: var(--color-base-dark-5);
  color: white;
`;

const PageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  color: white;
`;

const ButtonsWrapper = styled.div`
  display: flex;
  gap: 2rem;
`;


export default function AppNavWrapper({ title, button1, button2, children }: IAppNavWrapperProps) {
  const { isLoading } = useUserData();

  if (isLoading) return <div style={{
    width: "100vw",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "var(--color-base-dark)"
  }}>
    <LoadingSpinner size={60} />
    <p style={{ color: "white" }}>Loading...</p>
  </div>;

  return (
    <Wrapper>
      <Navigation />

      <RightPanel>
        <PageHeader>
          <Title className={titleFont.className}>{title}</Title>
          {(button1 || button2) && (
            <ButtonsWrapper>
              {button1}
              {button2}
            </ButtonsWrapper>
          )}
        </PageHeader>

        <div>{children}</div>
      </RightPanel>
    </Wrapper>
  );
}