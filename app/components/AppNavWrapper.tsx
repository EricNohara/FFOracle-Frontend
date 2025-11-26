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
  button3?: ReactNode;
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
  padding-bottom: 2rem;
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

const ContentWrapper = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  border-radius: var(--global-border-radius);
  background-color: var(--color-base-dark);

  /* Scrollbar styling for Webkit browsers (Chrome, Edge, Safari) */
  &::-webkit-scrollbar {
    width: 10px;
  }

  &::-webkit-scrollbar-track {
    background: var(--color-base-dark-3);
    border-radius: var(--global-border-radius);
  }

  &::-webkit-scrollbar-thumb {
    background-color: var(--color-primary);
    border-radius: var(--global-border-radius);
    border: 2px solid var(--color-base-dark-3);
  }
    
  /* Firefox */
  scrollbar-width: thin;
  scrollbar-color: var(--color-primary) var(--color-base-dark-3);
`;

export default function AppNavWrapper({ title, button1, button2, button3, children }: IAppNavWrapperProps) {
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
              {button3}
              {button2}
              {button1}
            </ButtonsWrapper>
          )}
        </PageHeader>

        <ContentWrapper>{children}</ContentWrapper>
      </RightPanel>
    </Wrapper>
  );
}