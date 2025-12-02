"use client";

import styled from "styled-components";
import { headerFont } from "@/app/localFont";

interface ISettingsTabsProps {
  activeTab: "general" | "roster" | "scoring";
  onTabChange: (tab: "general" | "roster" | "scoring") => void;
}

const TabsContainer = styled.div`
  display: flex;
  gap: 2rem;
  border-bottom: 2px solid var(--color-base-dark-3);
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    gap: 1rem;
    overflow-x: auto;
  }
`;

const Tab = styled.button<{ $isActive: boolean }>`
  background: none;
  border: none;
  color: ${({ $isActive }) => ($isActive ? "var(--color-primary)" : "white")};
  font-size: 1.5rem;
  font-weight: bold;
  padding: 1rem 0;
  cursor: pointer;
  position: relative;
  transition: color 0.2s ease;

  &:hover {
    color: var(--color-primary);
  }

  &::after {
    content: "";
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: var(--color-primary);
    opacity: ${({ $isActive }) => ($isActive ? 1 : 0)};
    transition: opacity 0.2s ease;
  }

  @media (max-width: 768px) {
    font-size: 1.2rem;
    padding: 0.75rem 0;
    white-space: nowrap;
  }
`;

export default function SettingsTabs({ activeTab, onTabChange }: ISettingsTabsProps) {
  return (
    <TabsContainer>
      <Tab
        className={headerFont.className}
        $isActive={activeTab === "general"}
        onClick={() => onTabChange("general")}
      >
        General
      </Tab>
      <Tab
        className={headerFont.className}
        $isActive={activeTab === "roster"}
        onClick={() => onTabChange("roster")}
      >
        Roster
      </Tab>
      <Tab
        className={headerFont.className}
        $isActive={activeTab === "scoring"}
        onClick={() => onTabChange("scoring")}
      >
        Scoring
      </Tab>
    </TabsContainer>
  );
}
