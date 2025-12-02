// components/Overlay.tsx
"use client";

import React, { ReactNode } from "react";
import styled from "styled-components";
import { X } from "lucide-react";

interface OverlayProps {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  height?: number;
}

const OverlayWrapper = styled.div<{ $isOpen: boolean }>`
  display: ${({ $isOpen }) => ($isOpen ? "flex" : "none")};
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.6);
  backdrop-filter: blur(5px);
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const OverlayContent = styled.div<{ $height: number }>`
  position: relative;
  background-color: var(--color-base-dark-3);
  border-radius: var(--global-border-radius);
  color: white;
  width: 50%;
  height: ${({ $height }) => `${$height}%`};
  display: flex;
  flex-direction: column;
  overflow: hidden;

  @media (max-width: 768px) {
    width: 95%;
    height: ${({ $height }) => `${Math.min($height + 10, 95)}%`};
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: var(--color-red);
  }
`;

export default function Overlay({ children, isOpen, onClose, height = 80 }: OverlayProps) {
  return (
    <OverlayWrapper $isOpen={isOpen} onClick={onClose}>
      <OverlayContent onClick={(e) => e.stopPropagation()} $height={height}>
        {children}
        <CloseButton onClick={onClose} aria-label="Close overlay">
          <X size={24} />
        </CloseButton>
      </OverlayContent>
    </OverlayWrapper>
  );
}
