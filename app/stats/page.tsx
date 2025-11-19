"use client";

import AppNavWrapper from "../components/AppNavWrapper";
import { useUserData } from "../context/UserDataProvider";
import { useEffect, useState } from "react";
import { ILeagueData, ILeagueDefense, IPlayerData } from "../interfaces/IUserData";
import styled from "styled-components";
import { usePlayersByPosition } from "../hooks/usePlayersByPosition";
import PlayerList from "../components/PlayerList";
import LoadingMessage from "../components/LoadingMessage";
import { useSearchParams } from "next/navigation";
import Overlay from "../components/Overlay/Overlay";
import PlayerStatsOverlay from "../components/Overlay/PlayerStatsOverlay";
import DefenseStatsOverlay from "../components/Overlay/DefenseStatsOverlay";
import { isSpaceRemainingForPlayerAtPosition } from "@/lib/utils/rosterSlots";

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
  const [showAddOverlay, setShowAddOverlay] = useState(false);
  const [showStatsOverlay, setShowStatsOverlay] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<IPlayerData | null>(null);
  const [selectedDefense, setSelectedDefense] = useState<ILeagueDefense | null>(null);

  const searchParams = useSearchParams();
  const leagueId = searchParams.get("leagueId");

  const POSITIONS = ["QB", "RB", "WR", "TE", "K", "DEF"];

  useEffect(() => {
    if (userData?.leagues && userData.leagues.length > 0) {
      setSelectedLeagueData(userData.leagues[0]);
    }
  }, [userData]);

  useEffect(() => {
    if (userData?.leagues && userData.leagues.length > 0 && leagueId) {
      setSelectedLeagueData(userData.leagues.find((l) => l.leagueId === leagueId) ?? userData.leagues[0]);
    }
  }, [userData, leagueId]);

  const { players, isLoading, refresh } = usePlayersByPosition(selectedPosition);

  let defenses: ILeagueDefense[] = [];
  let offensivePlayers: IPlayerData[] = [];

  if (players) {
    if (selectedPosition === "DEF") {
      defenses = (players as unknown as ILeagueDefense[]).map(d => ({ ...d, picked: false }));
    } else {
      offensivePlayers = (players as unknown as IPlayerData[])
        .map(p => ({ ...p, picked: false }))
        .sort((a, b) => (b.seasonStats?.fantasy_points ?? 0) - (a.seasonStats?.fantasy_points ?? 0));
    }
  }

  useEffect(() => {
    refresh();
  }, [selectedPosition, refresh]);

  const handleLeagueChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const leagueId = e.target.value;
    const league = userData?.leagues.find((l) => l.leagueId === leagueId) ?? null;
    setSelectedLeagueData(league);
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

  const onDefenseAdd = (defense: ILeagueDefense) => {
    setSelectedDefense(defense);
    setSelectedPlayer(null);

    if (isSpaceRemainingForPlayerAtPosition(selectedLeagueData, selectedPosition)) {
      alert("Player has space on their roster. Make the PUT route call here!");
      return;
    }

    // only show the overlay for choosing players to swap if the roster is full at that position
    setShowAddOverlay(true);
    setShowStatsOverlay(false);
  }

  const onDefenseClick = (defense: ILeagueDefense) => {
    setShowStatsOverlay(true);
    setSelectedPlayer(null);
    setSelectedDefense(defense);
  }

  const onPlayerAdd = (player: IPlayerData) => {
    setSelectedPlayer(player);
    setSelectedDefense(null);

    if (isSpaceRemainingForPlayerAtPosition(selectedLeagueData, selectedPosition)) {
      alert("Player has space on their roster. Make the PUT route call here!");
      return;
    }

    // only show the overlay for choosing players to swap if the roster is full at that position
    setShowAddOverlay(true);
    setShowStatsOverlay(false);
  }

  const onPlayerClick = (player: IPlayerData) => {
    setShowStatsOverlay(true);
    setSelectedDefense(null);
    setSelectedPlayer(player);
  }

  return (
    <AppNavWrapper title="LEAGUE STATS" button1={positionDropdown} button2={leagueDropdown}>
      {isLoading ?
        <LoadingMessage message="Loading players..." />
        : selectedPosition === "DEF" ? (
          <PlayerList players={[]} defenses={defenses} displayStartSit={false} onDefenseAdd={onDefenseAdd} onDefenseClick={onDefenseClick} />
        ) : (
          <PlayerList players={offensivePlayers} displayStartSit={false} onPlayerAdd={onPlayerAdd} onPlayerClick={onPlayerClick} />
        )}

      {/* overlays */}
      {showAddOverlay &&
        <Overlay isOpen={showAddOverlay} onClose={() => setShowAddOverlay(false)}>
          {selectedPlayer && `Adding ${selectedPlayer.player.name}`}
          {selectedDefense && `Adding ${selectedDefense.team.name}`}
        </Overlay>
      }
      {showStatsOverlay &&
        <Overlay isOpen={showStatsOverlay} onClose={() => setShowStatsOverlay(false)}>
          {selectedPlayer && <PlayerStatsOverlay player={selectedPlayer} onPlayerAdd={onPlayerAdd} />}
          {selectedDefense && <DefenseStatsOverlay defense={selectedDefense} onAddDefense={onDefenseAdd} />}
        </Overlay>
      }
    </AppNavWrapper>
  );
}
