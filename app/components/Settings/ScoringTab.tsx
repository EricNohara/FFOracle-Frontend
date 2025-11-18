"use client";

import styled from "styled-components";
import { headerFont } from "@/app/localFont";
import { IScoringSettings } from "@/app/interfaces/IUserData";

const TabContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 700px;
`;

const ScoringItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--color-base-dark-3);

  &:last-child {
    border-bottom: none;
  }
`;

const StatLabel = styled.span`
  color: white;
  font-size: 1rem;
  flex: 1;
`;

const InputWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
`;

const ValueInput = styled.input`
  width: 60px;
  padding: 0.5rem;
  font-size: 0.9rem;
  font-weight: bold;
  text-align: center;
  border-radius: var(--global-border-radius);
  border: 2px solid var(--color-base-dark-3);
  background-color: var(--color-base-dark-2);
  color: var(--color-txt-3);
  outline: none;
  transition: border-color 0.2s ease;

  &:focus {
    border-color: var(--color-primary);
    color: white;
  }

  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    opacity: 1;
  }
`;

const UnitText = styled.span`
  color: var(--color-txt-3);
  font-size: 0.9rem;
`;

interface IScoringTabProps {
  scoringSettings: IScoringSettings;
  onScoringChange: (field: keyof IScoringSettings, newValue: number) => void;
}

// Map database fields to display info
const scoringLabels: Record<keyof IScoringSettings, { label: string; unit: string }> = {
  id: { label: "", unit: "" },
  points_per_td: { label: "Touchdowns", unit: "points per touchdown" },
  points_per_reception: { label: "Receptions", unit: "points per reception" },
  points_per_rushing_yard: { label: "Rushing Yards", unit: "points per yard" },
  points_per_reception_yard: { label: "Receiving Yards", unit: "points per yard" },
  points_per_passing_yard: { label: "Passing Yards", unit: "points per yard" },
};

export default function ScoringTab({ scoringSettings, onScoringChange }: IScoringTabProps) {
  const editableFields: Array<keyof IScoringSettings> = [
    "points_per_td",
    "points_per_reception",
    "points_per_rushing_yard",
    "points_per_reception_yard",
    "points_per_passing_yard",
  ];

  return (
    <TabContent>
      {editableFields.map((field) => (
        <ScoringItem key={field}>
          <StatLabel className={headerFont.className}>
            {scoringLabels[field].label}
          </StatLabel>
          <InputWrapper>
            <ValueInput
              className={headerFont.className}
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={scoringSettings[field]}
              onChange={(e) => onScoringChange(field, parseFloat(e.target.value) || 0)}
            />
            <UnitText className={headerFont.className}>
              {scoringLabels[field].unit}
            </UnitText>
          </InputWrapper>
        </ScoringItem>
      ))}
    </TabContent>
  );
}
