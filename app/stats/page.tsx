"use client";

import AppNavWrapper from "../components/AppNavWrapper";
import { useUserData } from "../context/UserDataProvider";
import { useEffect, useState } from "react";
import { ILeagueData, ILeagueDefense, IPlayerData } from "../interfaces/IUserData";
import styled from "styled-components";
import { usePlayersByPosition } from "../hooks/usePlayersByPosition";
import PlayerList from "../components/PlayerList";
import LoadingSpinner from "../components/LoadingSpinner";

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

export default function StatsPage() {
  const { userData } = useUserData();
  const [selectedLeagueData, setSelectedLeagueData] = useState<ILeagueData | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<string>("QB");
  // const [players, setPlayers] = useState<PlayerResponse>(null);

  const POSITIONS = ["QB", "RB", "WR", "TE", "K", "DEF"];

  useEffect(() => {
    if (userData?.leagues && userData.leagues.length > 0) {
      setSelectedLeagueData(userData.leagues[0]);
    }
  }, [userData]);

  const { players, isLoading, error, refresh } = usePlayersByPosition(selectedPosition);

  let defenses: ILeagueDefense[] = [];
  let offensivePlayers: IPlayerData[] = [];

  if (players) {
    if (selectedPosition === "DEF") {
      defenses = (players as unknown as ILeagueDefense[]).map(d => ({ ...d, picked: false }));
    } else {
      offensivePlayers = (players as unknown as IPlayerData[]).map(p => ({ ...p, picked: false }));
    }
  }

  // Optional: If you want to manually trigger refresh whenever position changes
  useEffect(() => {
    refresh();
  }, [selectedPosition, refresh]);

  const handleLeagueChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const leagueId = e.target.value;
    const league = userData?.leagues.find((l) => l.leagueId === leagueId) ?? null;
    setSelectedLeagueData(league);
  };

  const handleAddPlayer = (playerId: string, playerName: string) => {
    // TODO: Implement actual add player functionality
    alert(`Adding ${playerName} to your team!`);
  };

  const handleAddDefense = (teamId: string, teamName: string) => {
    // TODO: Implement actual add defense functionality
    alert(`Adding ${teamName} defense to your team!`);
  };

  const leagueDropdown = (
    <LeagueDropdown
      value={selectedLeagueData?.leagueId ?? ""}
      onChange={handleLeagueChange}
    >
      {userData?.leagues.map((league) => (
        <option key={league.leagueId} value={league.leagueId}>
          {league.leagueName}
        </option>
      ))}
    </LeagueDropdown>
  );

  const positionDropdown = (
    <LeagueDropdown value={selectedPosition} onChange={(e) => setSelectedPosition(e.target.value)}>
      {POSITIONS.map((pos) => (
        <option key={pos} value={pos}>
          {pos}
        </option>
      ))}
    </LeagueDropdown>
  );

  return (
    <AppNavWrapper title="LEAGUE STATS" button1={positionDropdown} button2={leagueDropdown}>
      {isLoading ? (
        <div style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <LoadingSpinner size={50} />Loading players...
        </div>
      ) : selectedPosition === "DEF" ? (
        <PlayerList players={[]} defenses={defenses} displayStartSit={false} />
      ) : (
        <PlayerList players={offensivePlayers} displayStartSit={false} />
      )}
    </AppNavWrapper>
  );
}
