import { ReactNode, ButtonHTMLAttributes } from "react"
import { headerFont } from "../localFont"
import styled from "styled-components"

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
`;

const PrimaryButton = styled(ButtonBase)`
  background-color: var(--color-primary);

  &:hover {
    background-color: var(--color-primary-hover);
    cursor: pointer;
  }
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

export function PrimaryColorButton({ children, isFullWidth, ...props }: ButtonProps) {
  return (
    <PrimaryButton
      className={headerFont.className}
      $isFullWidth={isFullWidth}
      {...props}
    >
      {children}
    </PrimaryButton>
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