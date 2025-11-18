"use client";

import AppNavWrapper from "../components/AppNavWrapper";
import { PrimaryColorButton } from "../components/Buttons";
import { useRouter } from "next/navigation";
import { useUserData } from "../context/UserDataProvider";
import { useEffect, useState } from "react";
import { ILeagueData } from "../interfaces/IUserData";
import styled from "styled-components";
import PlayerList from "../components/PlayerList";

const LeagueDropdown = styled.select`
  padding: 0.5rem 1rem;
  border-radius: var(--global-border-radius);
  background-color: var(--color-base-dark-4);
  color: white;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  outline: none;
  transition: border-color 0.2s ease, background-color 0.2s ease;

  option {
    background-color: var(--color-base-dark-3);
    color: white;
  }
`;

export default function DashboardPage() {
    const router = useRouter();
    const { userData } = useUserData();
    const [selectedLeagueData, setSelectedLeagueData] = useState<ILeagueData | null>(null);

    // Set default selected league on load (first one)
    useEffect(() => {
        if (userData?.leagues && userData.leagues.length > 0) {
            setSelectedLeagueData(userData.leagues[0]);
        }
    }, [userData]);

    const handleLeagueChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const leagueId = e.target.value;
        const league = userData?.leagues.find(l => l.leagueId === leagueId) ?? null;
        setSelectedLeagueData(league);
    };

    const handleClickAdvice = () => {
        const tokensRemaining = userData?.userInfo.tokens_left ?? 0;
        const name = userData?.userInfo.fullname ? userData?.userInfo.fullname : "";

        if (tokensRemaining <= 0) {
            alert(`User ${name} has ${tokensRemaining} tokens remaining. Purchase more tokens to continue.`);
            return;
        }

        alert(`User ${name}, would you like to spend one token to generate ai advice? Operation cannot be reversed. You will have ${tokensRemaining - 1} tokens remaining after this operation.`)

        router.push(`/dashboard/advice?leagueId=${selectedLeagueData?.leagueId}`)
    }

    const editButton = <PrimaryColorButton onClick={() => router.push("/stats")}>Edit Roster</PrimaryColorButton>;
    const adviceButton = <PrimaryColorButton onClick={handleClickAdvice}>Generate Advice</PrimaryColorButton>;

    // Secondary "button" as dropdown
    const leagueDropdown = (
        <LeagueDropdown value={selectedLeagueData?.leagueId ?? ""} onChange={handleLeagueChange}>
            {userData?.leagues.map(league => (
                <option key={league.leagueId} value={league.leagueId}>
                    {league.leagueName}
                </option>
            ))}
        </LeagueDropdown>
    );

    return (
        <AppNavWrapper title="ROSTER DASHBOARD" button1={(selectedLeagueData?.players?.length ?? 0) > 0 ? adviceButton : editButton} button2={leagueDropdown}>
            {selectedLeagueData ? (
                <PlayerList players={selectedLeagueData.players ?? []} defenses={selectedLeagueData.defenses ?? []} />
            ) : (
                <p>No league selected</p>
            )}
        </AppNavWrapper>
    )
}