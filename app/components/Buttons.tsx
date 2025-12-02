import React, { ReactNode, ButtonHTMLAttributes, ForwardedRef } from "react";
import { headerFont } from "../localFont"
import styled from "styled-components"
import { Plus, OctagonMinus } from "lucide-react";

const ButtonBase = styled.button<{ $isFullWidth?: boolean }>`
  padding: 0.5rem 1.5rem;
  font-size: 0.9rem;
  font-weight: bold;
  border: none;
  border-radius: var(--global-border-radius);
  color: white;
  transition: 0.2s ease;
  width: ${({ $isFullWidth }) => ($isFullWidth ? "100%" : "auto")};

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;

    &:hover {
      background-color: inherit;
    }
  }

  @media (max-width: 768px) {
    width: ${({ $isFullWidth }) => ($isFullWidth ? "100%" : "100%")};
    font-size: 0.85rem;
    padding: 0.6rem 1rem;
  }
`;

const PrimaryButton = styled(ButtonBase)`
  background-color: var(--color-primary);

  &:hover {
    background-color: var(--color-primary-hover);
    cursor: pointer;
  }
`;

const PrimarySmallButton = styled(PrimaryButton)`
  padding: 0.3rem;
`;

const PrimaryOutlinedButton = styled(ButtonBase)`
  background-color: transparent;
  border: 2px solid var(--color-primary);

  &:hover {
    background-color: var(--color-primary);
    cursor: pointer;
  }
`;

const SecondaryButton = styled(ButtonBase)`
    background-color: var(--color-secondary);

    &:hover {
        background-color: var(--color-secondary-hover);
        border: none;
        cursor: pointer;
    }
`;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  href?: string;
  isFullWidth?: boolean;
}

export const PrimaryColorButton = React.forwardRef<
  HTMLButtonElement,
  ButtonProps
>(({ children, isFullWidth, ...props }, ref: ForwardedRef<HTMLButtonElement>) => {
  return (
    <PrimaryButton
      ref={ref}
      $isFullWidth={isFullWidth}
      className={headerFont.className}
      {...props}
    >
      {children}
    </PrimaryButton>
  );
});

// Optional: set displayName for better debugging
PrimaryColorButton.displayName = "PrimaryColorButton";

interface AddButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  href?: string;
  isFullWidth?: boolean;
}

export function AddButton({ isFullWidth, ...props }: AddButtonProps) {
  return (
    <PrimarySmallButton
      className={headerFont.className}
      $isFullWidth={isFullWidth}
      {...props}
    >
      <Plus size={30} />
    </PrimarySmallButton>
  );
}

export function DeleteButton({ isFullWidth, ...props }: AddButtonProps) {
  return (
    <PrimarySmallButton
      className={headerFont.className}
      $isFullWidth={isFullWidth}
      {...props}
    >
      <OctagonMinus size={30} />
    </PrimarySmallButton>
  );
}

export function PrimaryColorOutlinedButton({ children, isFullWidth, ...props }: ButtonProps) {
  return (
    <PrimaryOutlinedButton
      className={headerFont.className}
      $isFullWidth={isFullWidth}
      {...props}
    >
      {children}
    </PrimaryOutlinedButton>
  );
}

export function SecondaryColorButton({ children, isFullWidth, ...props }: ButtonProps) {
  return (
    <SecondaryButton
      className={headerFont.className}
      $isFullWidth={isFullWidth}
      {...props}
    >
      {children}
    </SecondaryButton>
  );
}