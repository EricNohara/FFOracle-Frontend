import styled from "styled-components";
import { ChangeEvent } from "react";
import { headerFont } from "../localFont";

interface ITextInputProps {
    label: string;
    name: string;
    value: string;
    placeholder?: string;
    type?: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    required?: boolean;
}

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
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
`;

const Input = styled.input`
  padding: 0.75rem 1rem;
  font-size: 1rem;
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

  /* fix autofill background in Chrome / Edge / Safari */
  &:-webkit-autofill,
  &:-webkit-autofill:hover,
  &:-webkit-autofill:focus {
    -webkit-box-shadow: 0 0 0 1000px var(--color-base-dark-3) inset !important;
    -webkit-text-fill-color: white !important;
    transition: background-color 9999s ease-out 0s;
  }

  /* optional for Firefox */
  &:-moz-autofill {
    box-shadow: 0 0 0 1000px var(--color-base-dark-3) inset !important;
    -moz-text-fill-color: white !important;
  }
`;

export default function TextInput({
    label,
    name,
    value,
    placeholder,
    type = "text",
    onChange,
    required = false
}: ITextInputProps) {
    return (
        <InputWrapper>
            <Label className={headerFont.className} htmlFor={name}>{label}</Label>
            <Input
                id={name}
                name={name}
                type={type}
                value={value}
                placeholder={placeholder}
                onChange={onChange}
                required={required}
            />
        </InputWrapper>
    );
}
