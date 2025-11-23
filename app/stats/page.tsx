"use client";

import AppNavWrapper from "../components/AppNavWrapper";
import { useUserData } from "../context/UserDataProvider";
import { useEffect, useState, useRef } from "react";
import { ILeagueData, ILeagueDefense, IPlayerData } from "../interfaces/IUserData";
import styled from "styled-components";
import { usePlayersByPosition } from "../hooks/usePlayersByPosition";
import PlayerList from "../components/PlayerList";
import LoadingMessage from "../components/LoadingMessage";
import { useSearchParams } from "next/navigation";
import Overlay from "../components/Overlay/Overlay";
import PlayerStatsOverlay from "../components/Overlay/PlayerStatsOverlay";
import DefenseStatsOverlay from "../components/Overlay/DefenseStatsOverlay";
import { FLEX_ELIGIBLE, isSpaceRemainingForPlayerAtPosition } from "@/lib/utils/rosterSlots";
import { PrimaryColorButton } from "../components/Buttons";
import { createClient } from "@/lib/supabase/client";
import { headerFont } from "../localFont";

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

const SelectPlayerOverlay = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
  height: 100%;
  overflow: hidden;
  overflow-y: auto;
  background-color: var(--color-base-dark);
  border-radius: var(--global-border-radius);
`;

const SelectPlayerTitle = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  text-align: center;
`;

const SelectPlayerSubtitle = styled.h2`
  font-size: 1rem;
  color: var(--color-txt-2);
  text-align: center;
`;

const StickyHeader = styled.div`
  position: sticky;
  top: 0;
  background-color: var(--color-primary);
  z-index: 10;
  padding: 2rem;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1.5rem;
  border-radius: var(--global-border-radius);
  background-color: var(--color-base-dark-4);
  border: none;
  outline: none;
  font-size: 1rem;
  color: white;
  margin-bottom: 1rem;

  &::placeholder {
    color: var(--color-txt-3);
  }
`;


export default function StatsPage() {
  const { userData, refreshUserData } = useUserData();
  const supabase = createClient();
  const [selectedLeagueData, setSelectedLeagueData] = useState<ILeagueData | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<string>("QB");
  const [showAddOverlay, setShowAddOverlay] = useState(false);
  const [showStatsOverlay, setShowStatsOverlay] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<IPlayerData | null>(null);
  const [selectedDefense, setSelectedDefense] = useState<ILeagueDefense | null>(null);
  const [selectedPlayerToSwap, setSelectedPlayerToSwap] = useState<IPlayerData | null>(null);
  const [selectedDefenseToSwap, setSelectedDefenseToSwap] = useState<ILeagueDefense | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const swapButtonRef = useRef<HTMLButtonElement | null>(null);

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

  const onDefenseAdd = async (defense: ILeagueDefense) => {
    setSelectedDefense(defense);
    setSelectedPlayer(null);

    if (selectedLeagueData?.defenses.some((d) => d.team.id === defense.team.id)) {
      alert("Defense is already on your roster for this league");
      return;
    } else if (isSpaceRemainingForPlayerAtPosition(selectedLeagueData, selectedPosition)) {
      try {
        // get the session
        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData?.session?.access_token;
        if (!accessToken) throw new Error("User not authenticated");

        const payload = {
          leagueId: selectedLeagueData?.leagueId,
          memberId: defense.team.id,
          isDefense: true
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/UpdateUserLeague/member`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        })

        if (!res.ok) throw new Error("Failed to add defense to roster")
        refreshUserData();
      } catch (e) {
        alert("Failed to add defense to roster")
        console.error(e);
      } finally {
        // close the stats overlay if it is open
        setShowStatsOverlay(false);
      }
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

  const onPlayerAdd = async (player: IPlayerData) => {
    setSelectedPlayer(player);
    setSelectedDefense(null);

    if (selectedLeagueData?.players.some((p) => p.player.id === player.player.id)) {
      alert("Player is already on your roster for this league");
      return;
    } else if (isSpaceRemainingForPlayerAtPosition(selectedLeagueData, selectedPosition)) {
      try {
        // get the session
        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData?.session?.access_token;
        if (!accessToken) throw new Error("User not authenticated");

        const payload = {
          leagueId: selectedLeagueData?.leagueId,
          memberId: player.player.id,
          isDefense: false
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/UpdateUserLeague/member`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        })

        if (!res.ok) throw new Error("Failed to add player to roster")
        refreshUserData();
      } catch (e) {
        alert("Failed to add player to roster")
        console.error(e);
      } finally {
        // close the stats overlay if it is open
        setShowStatsOverlay(false);
      }
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

  const onPlayerSwapClick = async () => {
    try {
      // get the session
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;
      if (!accessToken) throw new Error("User not authenticated");

      // construct payload for player/defense updates
      const payload = {
        leagueId: selectedLeagueData?.leagueId,
        oldMemberId: selectedPlayerToSwap ? selectedPlayerToSwap?.player.id : selectedDefenseToSwap?.team.id,
        oldIsDefense: selectedDefenseToSwap ? true : false,
        newMemberId: selectedPlayer ? selectedPlayer?.player.id : selectedDefense?.team.id,
        newIsDefense: selectedDefense ? true : false
      };

      // call the swap endpoint
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/UpdateUserLeague/member`,
        {
          method: "PUT",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });

      if (!res.ok) throw new Error("Player swap failed");
      refreshUserData();
    } catch (e) {
      alert("Player swap failed")
      console.error(e);
    } finally {
      // unselect the player and the player to swap
      setShowAddOverlay(false);
      setSelectedPlayer(null);
      setSelectedDefense(null);
      setSelectedPlayerToSwap(null);
      setSelectedDefenseToSwap(null);
    }
  }

  const filteredOffensivePlayers = offensivePlayers.filter(p =>
    p.player && p.player.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDefenses = defenses.filter(d =>
    d.team && d.team.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppNavWrapper title="LEAGUE STATS" button1={positionDropdown} button2={leagueDropdown}>
      {isLoading ? (
        <LoadingMessage message="Loading players..." />
      ) : (
        <>
          <SearchInput
            placeholder={"Search players..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {selectedPosition === "DEF" ? (
            <PlayerList
              players={[]}
              defenses={filteredDefenses}
              displayStartSit={false}
              onDefenseAdd={onDefenseAdd}
              onDefenseClick={onDefenseClick}
            />
          ) : (
            <PlayerList
              players={filteredOffensivePlayers}
              displayStartSit={false}
              onPlayerAdd={onPlayerAdd}
              onPlayerClick={onPlayerClick}
            />
          )}
        </>
      )}

      {/* overlays */}
      {showAddOverlay &&
        <Overlay isOpen={showAddOverlay} onClose={() => setShowAddOverlay(false)}>
          <SelectPlayerOverlay ref={scrollContainerRef}>
            <StickyHeader>
              <SelectPlayerTitle className={headerFont.className}>Your roster is full</SelectPlayerTitle>
              <SelectPlayerSubtitle className={headerFont.className}>Select a player to swap out</SelectPlayerSubtitle>
            </StickyHeader>
            <div style={{ padding: "2rem" }}>
              <PlayerList
                players={selectedPosition !== "DEF"
                  ? selectedLeagueData?.players.filter((p) => {
                    if (FLEX_ELIGIBLE.includes(selectedPosition)) {
                      return FLEX_ELIGIBLE.includes(p.player.position);
                    } else {
                      return p.player.position === selectedPosition;
                    }
                  }) ?? []
                  : []
                }
                onPlayerClick={(player: IPlayerData) => {
                  if (selectedPlayerToSwap && selectedPlayerToSwap.player.id === player.player.id) {
                    setSelectedPlayerToSwap(null);
                    return;
                  }
                  setSelectedPlayerToSwap(player);
                  setTimeout(() => {
                    swapButtonRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
                  }, 50);
                }}
                defenses={selectedPosition === "DEF" ? selectedLeagueData?.defenses ?? [] : []}
                onDefenseClick={(defense: ILeagueDefense) => {
                  if (selectedDefenseToSwap && selectedDefenseToSwap.team.id === defense.team.id) {
                    setSelectedDefenseToSwap(null);
                    return;
                  }
                  setSelectedDefenseToSwap(defense);
                  setTimeout(() => {
                    swapButtonRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
                  }, 50);
                }}
                displayStartSit={false}
                selectable={true}
              />
            </div>
            <div style={{ width: "100%", padding: "0 2rem 2rem 2rem" }}>
              <PrimaryColorButton
                onClick={onPlayerSwapClick}
                ref={swapButtonRef}
                disabled={!selectedPlayerToSwap && !selectedDefenseToSwap}
                style={{ width: "100%" }}
              >
                Swap
              </PrimaryColorButton>
            </div>
          </SelectPlayerOverlay>
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
