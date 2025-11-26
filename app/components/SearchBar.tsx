"use client";

import styled, { css } from "styled-components";

const Wrapper = styled.div<{ $sticky?: boolean }>`
  ${({ $sticky }) =>
    $sticky &&
    css`
      position: sticky;
      top: 0;
      z-index: 20;
    `}
`;

const SearchInput = styled.input<{ $color: string }>`
  width: 100%;
  padding: 0.75rem 1.5rem;
  border-radius: var(--global-border-radius);
  background-color: ${({ $color }) => $color || "transparent"};
  border: none;
  outline: none;
  font-size: 1rem;
  color: white;
  margin-bottom: 1rem;

  &::placeholder {
    color: var(--color-txt-3);
  }
`;


interface SearchBarProps {
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
  sticky?: boolean;
  color?: string;
}

export default function SearchBar({
  value,
  placeholder = "Search...",
  onChange,
  autoFocus = false,
  sticky = false,
  color = "var(--color-base-dark-4)"
}: SearchBarProps) {
  return (
    <Wrapper $sticky={sticky}>
      <SearchInput
        value={value}
        placeholder={placeholder}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        $color={color}
      />
    </Wrapper>
  );
}
