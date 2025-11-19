import React from "react";
import styled, { keyframes } from "styled-components";

// Keyframes for spinning animation
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

// Styled component for the spinner
const SpinnerWrapper = styled.div<{ size: number; color: string }>`
  border: 4px solid rgba(0, 0, 0, 0.1); // light background
  border-top: 4px solid ${(props) => props.color}; // primary color
  border-radius: 50%;
  width: ${(props) => props.size}px;
  height: ${(props) => props.size}px;
  animation: ${spin} 1s linear infinite;
`;

// Props interface
interface LoadingSpinnerProps {
  size?: number;
  color?: string;
}

// Spinner component
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 40, color = "var(--color-primary)" }) => {
  return <SpinnerWrapper size={size} color={color} />;
};

export default LoadingSpinner;
