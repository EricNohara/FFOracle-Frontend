import styled from "styled-components";
import { ChangeEvent } from "react";
import { headerFont } from "../localFont";

const InputWrapper = styled.div<{ $compact?: boolean }>`
  display: flex;
  flex-direction: column;
  margin-bottom: ${(props) => (props.$compact ? "0.5rem" : "1rem")};
  width: 100%;

  &:focus-within label {
    color: var(--color-primary);
  }
`;

const Label = styled.label`
  font-size: 0.85rem;
  color: white;
  font-weight: bold;
  margin-bottom: 0.5rem;
  transition: 0.2s ease;
`;

const Input = styled.input<{ $compact?: boolean }>`
  padding: ${(props) => (props.$compact ? "0.4rem 0.8rem" : "0.75rem 1rem")};
  font-size: ${(props) => (props.$compact ? "0.85rem" : "1rem")};
  border-radius: var(--global-border-radius);
  border: 2px solid var(--color-txt-3);
  color: white;
  outline: none;
  background-color: var(--color-base-dark-3);
  transition: border-color 0.2s ease, background-color 0.2s ease;

  &::placeholder {
    color: var(--color-txt-3);
  }

  &:focus {
    border-color: var(--color-primary);
  }

  &:disabled {
    background-color: var(--color-base-dark-2);
    color: var(--color-txt-3);
    border-color: var(--color-base-dark-3);
    cursor: not-allowed;
    opacity: 0.7;
  }

  &:-webkit-autofill,
  &:-webkit-autofill:hover,
  &:-webkit-autofill:focus {
    -webkit-box-shadow: 0 0 0 1000px var(--color-base-dark-3) inset !important;
    -webkit-text-fill-color: white !important;
    transition: background-color 9999s ease-out 0s;
  }

  &:-moz-autofill {
    box-shadow: 0 0 0 1000px var(--color-base-dark-3) inset !important;
    -moz-text-fill-color: white !important;
  }
`;

interface ITextInputProps {
  id?: string;
  label: string;
  name: string;
  value: string;
  placeholder?: string;
  type?: string;
  min?: number;
  step?: number;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  compact?: boolean;
  disabled?: boolean;
}

export default function TextInput({
  id = "",
  label,
  name,
  value,
  placeholder,
  type = "text",
  min,
  step,
  onChange,
  required = false,
  compact = false,
  disabled = false
}: ITextInputProps) {
  return (
    <InputWrapper id={id}>
      <Label className={headerFont.className} htmlFor={name}>{!required ? label : `${label} *`}</Label>
      <Input
        id={name}
        name={name}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        required={required}
        $compact={compact}
        disabled={disabled}
        min={min}
        step={step}
      />
    </InputWrapper>
  );
}
