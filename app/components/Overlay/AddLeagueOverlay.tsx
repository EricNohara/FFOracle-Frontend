"use client";

import styled from "styled-components";
import Overlay from "./Overlay";
import { useState } from "react";
import { PrimaryColorButton } from "../Buttons";
import { headerFont } from "@/app/localFont";
import TextInput from "../TextInput";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (payload: unknown) => Promise<void>;
}

const Wrapper = styled.div`
  background: var(--color-base-dark);
  padding: 2rem;
  border-radius: var(--global-border-radius);
  width: 100%;
  height: 100%;
  overflow-y: auto;
  color: white;
`;

const Title = styled.h2`
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
  text-align: center;
`;

const SectionTitle = styled.h3`
  margin-top: 1rem;
  margin-bottom: .5rem;
  font-size: 1.25rem;
  font-weight: bold;
  color: white;
`;

const TwoColumn = styled.div`
  width: 100%;
  display: flex;
  gap: 2rem;
`;

export default function AddLeagueOverlay({ isOpen, onClose, onCreate }: Props) {
    const [leagueName, setLeagueName] = useState("");
    const [rosterSettings, setRosterSettings] = useState({
        qb: 1, rb: 2, wr: 2, te: 1, flex: 1, k: 1, def: 1, bench: 5,
    });

    const [scoring, setScoring] = useState({
        "PASSING YD POINTS": 0.04,
        "RUSHING YD POINTS": 0.1,
        "RECEIVING YD POINTS": 0.1,
        "RECEPTION POINTS": 1,
        "TOUCHDOWN POINTS": 6,
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); // prevent full page reload

        await onCreate({
            name: leagueName,
            qbCount: rosterSettings.qb,
            rbCount: rosterSettings.rb,
            wrCount: rosterSettings.wr,
            teCount: rosterSettings.te,
            flexCount: rosterSettings.flex,
            kCount: rosterSettings.k,
            defenseCount: rosterSettings.def,
            benchCount: rosterSettings.bench,
            pointsPerTd: scoring["TOUCHDOWN POINTS"],
            pointsPerReception: scoring["RECEPTION POINTS"],
            pointsPerPassingYard: scoring["PASSING YD POINTS"],
            pointsPerRushingYard: scoring["RUSHING YD POINTS"],
            pointsPerReceivingYard: scoring["RECEIVING YD POINTS"],
        });

        onClose();
    };

    return (
        <Overlay isOpen={isOpen} onClose={onClose}>
            <Wrapper>

                <form onSubmit={handleSubmit}>

                    <Title className={headerFont.className}>Add New League</Title>

                    <TextInput
                        label="League Name"
                        name="leagueName"
                        placeholder="Enter league name"
                        value={leagueName}
                        onChange={(e) => setLeagueName(e.target.value)}
                        required
                    />

                    <TwoColumn>
                        <div style={{ width: "100%" }}>
                            <SectionTitle>Roster Settings</SectionTitle>
                            {Object.entries(rosterSettings).map(([key, val]) => (
                                <TextInput
                                    key={key}
                                    type="number"
                                    min={0}
                                    step={1}
                                    label={key.toUpperCase()}
                                    name={key.toUpperCase()}
                                    value={String(val)}
                                    onChange={(e) =>
                                        setRosterSettings((prev) => ({
                                            ...prev,
                                            [key]: parseInt(e.target.value),
                                        }))
                                    }
                                    placeholder={key.toUpperCase()}
                                    required
                                />
                            ))}
                        </div>

                        <div style={{ width: "100%" }}>
                            <SectionTitle>Scoring Settings</SectionTitle>
                            {Object.entries(scoring).map(([key, val]) => (
                                <TextInput
                                    key={key}
                                    type="number"
                                    min={0}
                                    step={0.01}
                                    label={key.toUpperCase()}
                                    name={key.toUpperCase()}
                                    value={String(val)}
                                    onChange={(e) =>
                                        setScoring((prev) => ({
                                            ...prev,
                                            [key]: Number(e.target.value),
                                        }))
                                    }
                                    placeholder={key.toUpperCase()}
                                    required
                                />
                            ))}
                        </div>
                    </TwoColumn>

                    {/* SUBMIT BUTTON */}
                    <PrimaryColorButton
                        type="submit"
                        style={{ width: "100%", marginTop: "1.5rem" }}
                    >
                        Create League
                    </PrimaryColorButton>

                </form>
            </Wrapper>
        </Overlay>
    );
}
