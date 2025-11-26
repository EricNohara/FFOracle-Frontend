"use client";

import styled from "styled-components";

const Select = styled.select`
  width: 150px;
  padding: 0.5rem 1rem;
  border-radius: var(--global-border-radius);
  background-color: var(--color-base-dark-4);
  color: white;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  outline: none;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  option {
    white-space: normal;
    background-color: var(--color-base-dark-3);
    color: white;
  }
`;

interface GenericDropdownProps<T> {
    items: T[];
    selected: T | null;
    getKey: (item: T) => string;
    getLabel: (item: T) => string;
    onChange: (item: T) => void;
}

export default function GenericDropdown<T>({
    items,
    selected,
    getKey,
    getLabel,
    onChange,
}: GenericDropdownProps<T>) {
    return (
        <Select
            value={selected ? getKey(selected) : ""}
            onChange={(e) => {
                const item = items.find((i) => getKey(i) === e.target.value);
                if (item) onChange(item);
            }}
        >
            {items.map((item) => (
                <option key={getKey(item)} value={getKey(item)}>
                    {getLabel(item)}
                </option>
            ))}
        </Select>
    );
}
