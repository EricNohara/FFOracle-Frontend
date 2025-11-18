"use client";

import styled from "styled-components";
import { headerFont } from "@/app/localFont";
import { IRosterSettings } from "@/app/interfaces/IUserData";

const TabContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 500px;
`;

const RosterItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--color-base-dark-3);

  &:last-child {
    border-bottom: none;
  }
`;

const PositionLabel = styled.span`
  color: white;
  font-size: 1rem;
`;

const CountInput = styled.input`
  width: 60px;
  padding: 0.5rem;
  font-size: 1rem;
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

interface IRosterTabProps {
  rosterSettings: IRosterSettings;
  onRosterChange: (field: keyof IRosterSettings, newCount: number) => void;
}

// Map database fields to display names
const positionLabels: Record<keyof IRosterSettings, string> = {
  id: "",
  qb_count: "Quarterbacks (QB)",
  rb_count: "Running Backs (RB)",
  wr_count: "Wide Receivers (WR)",
  te_count: "Tight Ends (TE)",
  k_count: "Kickers (K)",
  flex_count: "Flex (FLEX)",
  def_count: "Defense (DEF)",
  bench_count: "Bench (BN)",
  ir_count: "Injured Reserve (IR)",
};

export default function RosterTab({ rosterSettings, onRosterChange }: IRosterTabProps) {
  const editableFields: Array<keyof IRosterSettings> = [
    "qb_count",
    "rb_count",
    "wr_count",
    "te_count",
    "k_count",
    "flex_count",
    "def_count",
    "bench_count",
    "ir_count",
  ];

  return (
    <TabContent>
      {editableFields.map((field) => (
        <RosterItem key={field}>
          <PositionLabel className={headerFont.className}>
            {positionLabels[field]}
          </PositionLabel>
          <CountInput
            className={headerFont.className}
            type="number"
            min="0"
            max="20"
            value={rosterSettings[field]}
            onChange={(e) => onRosterChange(field, parseInt(e.target.value) || 0)}
          />
        </RosterItem>
      ))}
    </TabContent>
  );
}
