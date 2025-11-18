"use client";

import styled from "styled-components";
import { headerFont } from "../localFont";

interface IToggleSwitchProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const ToggleWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.5rem;
`;

const ToggleLabel = styled.label`
  color: white;
  font-size: 0.9rem;
  cursor: pointer;
  user-select: none;
`;

const ToggleButton = styled.button<{ $isActive: boolean }>`
  position: relative;
  width: 50px;
  height: 26px;
  background-color: ${({ $isActive }) =>
    $isActive ? "var(--color-primary)" : "var(--color-base-dark-3)"};
  border: 2px solid ${({ $isActive }) =>
    $isActive ? "var(--color-primary)" : "var(--color-txt-3)"};
  border-radius: 13px;
  cursor: pointer;
  transition: background-color 0.3s ease, border-color 0.3s ease;
  padding: 0;
  outline: none;

  &:hover {
    background-color: ${({ $isActive }) =>
      $isActive ? "var(--color-primary-hover)" : "var(--color-base-dark-2)"};
  }

  &:focus {
    box-shadow: 0 0 0 2px rgba(199, 80, 0, 0.3);
  }
`;

const ToggleSlider = styled.span<{ $isActive: boolean }>`
  position: absolute;
  top: 2px;
  left: ${({ $isActive }) => ($isActive ? "26px" : "2px")};
  width: 18px;
  height: 18px;
  background-color: white;
  border-radius: 50%;
  transition: left 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

export default function ToggleSwitch({ label, checked, onChange }: IToggleSwitchProps) {
  return (
    <ToggleWrapper>
      <ToggleButton
        type="button"
        $isActive={checked}
        onClick={() => onChange(!checked)}
        aria-label={label}
        role="switch"
        aria-checked={checked}
      >
        <ToggleSlider $isActive={checked} />
      </ToggleButton>
      <ToggleLabel className={headerFont.className} onClick={() => onChange(!checked)}>
        {label}
      </ToggleLabel>
    </ToggleWrapper>
  );
}
