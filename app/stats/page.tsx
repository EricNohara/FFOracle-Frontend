"use client";

import AppNavWrapper from "../components/AppNavWrapper";
import { useUserData } from "../context/UserDataProvider";
import { useEffect, useState, useRef, Suspense } from "react";
import { ILeagueData, ILeagueDefense, IPlayerData } from "../interfaces/IUserData";
import styled from "styled-components";
import { usePlayersByPosition } from "../hooks/usePlayersByPosition";
import PlayerList from "../components/PlayerList";
import LoadingMessage from "../components/LoadingMessage";
import { useSearchParams } from "next/navigation";
import Overlay from "../components/Overlay/Overlay";
import PlayerStatsOverlay from "../components/Overlay/PlayerStatsOverlay";
import DefenseStatsOverlay from "../components/Overlay/DefenseStatsOverlay";
import { FLEX_ELIGIBLE, getRosterSlotsByPosition, isSpaceRemainingForPlayerAtPosition } from "@/lib/utils/rosterSlots";
import { PrimaryColorButton } from "../components/Buttons";
import { headerFont } from "../localFont";
import GenericDropdown from "../components/GenericDropdown";
import SearchBar from "../components/SearchBar";
import { authFetch } from "@/lib/supabase/authFetch";

// Overlay for choosing a player to swap
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

// Titles in swap overlay
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

// Sticky header to keep title visible during scroll
const StickyHeader = styled.div`
  position: sticky;
  top: 0;
  background-color: var(--color-primary);
  z-index: 10;
  padding: 2rem;
`;

export default function StatsPage() {
  return (
    <Suspense>
      <StatsPageContent />
    </Suspense>
  );
}

function StatsPageContent() {
  const { userData, refreshUserData } = useUserData();

  // Current league and selected filters
  const [selectedLeagueData, setSelectedLeagueData] = useState<ILeagueData | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<string>("QB");

  // Overlay state for add/swap and stats display
  const [showAddOverlay, setShowAddOverlay] = useState(false);
  const [showStatsOverlay, setShowStatsOverlay] = useState(false);

  // Player/defense selections for viewing or swapping
  const [selectedPlayer, setSelectedPlayer] = useState<IPlayerData | null>(null);
  const [selectedDefense, setSelectedDefense] = useState<ILeagueDefense | null>(null);
  const [selectedPlayerToSwap, setSelectedPlayerToSwap] = useState<IPlayerData | null>(null);
  const [selectedDefenseToSwap, setSelectedDefenseToSwap] = useState<ILeagueDefense | null>(null);

  // Search input
  const [searchQuery, setSearchQuery] = useState("");

  // Refs for smooth scrolling
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const swapButtonRef = useRef<HTMLButtonElement | null>(null);

  // Read leagueId from URL
  const searchParams = useSearchParams();
  const leagueId = searchParams.get("leagueId");

  const POSITIONS = ["QB", "RB", "WR", "TE", "K", "DEF"];

  // Set initial league
  useEffect(() => {
    if (userData?.leagues && userData.leagues.length > 0) {
      setSelectedLeagueData(userData.leagues[0]);
    }
  }, [userData]);

  // Override league if leagueId is in the URL
  useEffect(() => {
    if (userData?.leagues && userData.leagues.length > 0 && leagueId) {
      setSelectedLeagueData(
        userData.leagues.find((l) => l.leagueId === leagueId) ?? userData.leagues[0]
      );
    }
  }, [userData, leagueId]);

  // Fetch players for selected position
  const { players, isLoading, refresh } = usePlayersByPosition(selectedPosition);

  // Separate offense vs defense for list display
  let defenses: ILeagueDefense[] = [];
  let offensivePlayers: IPlayerData[] = [];

  if (players) {
    if (selectedPosition === "DEF") {
      defenses = (players as ILeagueDefense[]).map(d => ({ ...d, picked: false }));
    } else {
      offensivePlayers = (players as IPlayerData[])
        .map(p => ({ ...p, picked: false }))
        .sort((a, b) => (b.seasonStats?.fantasy_points ?? 0) - (a.seasonStats?.fantasy_points ?? 0));
    }
  }

  // Refresh when the position changes
  useEffect(() => {
    refresh();
  }, [selectedPosition, refresh]);

  // League dropdown UI
  const leagueDropdown = (
    <GenericDropdown
      items={userData?.leagues ?? []}
      selected={selectedLeagueData}
      getKey={(l) => l.leagueId}
      getLabel={(l) => l.leagueName}
      onChange={(league) => setSelectedLeagueData(league)}
    />
  );

  // Position dropdown UI
  const positionDropdown = (
    <GenericDropdown
      items={POSITIONS}
      selected={selectedPosition}
      getKey={(pos) => pos}
      getLabel={(pos) => pos}
      onChange={(pos) => setSelectedPosition(pos)}
    />
  );

  // Add a defense to roster
  const onDefenseAdd = async (defense: ILeagueDefense) => {
    setSelectedDefense(defense);
    setSelectedPlayer(null);

    // Prevent duplicate adds
    if (selectedLeagueData?.defenses.some((d) => d.team.id === defense.team.id)) {
      alert("Defense is already on your roster for this league");
      return;
    }

    // If there is space, add immediately
    if (isSpaceRemainingForPlayerAtPosition(selectedLeagueData, selectedPosition)) {
      try {
        const payload = {
          leagueId: selectedLeagueData?.leagueId,
          memberId: defense.team.id,
          isDefense: true
        };

        const res = await authFetch(
          `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/UpdateUserLeague/member`,
          { method: "POST", body: JSON.stringify(payload) }
        );

        if (!res.ok) throw new Error("Failed to add defense to roster");
        refreshUserData();
      } catch (e) {
        alert("Failed to add defense to roster");
        console.error(e);
      } finally {
        setShowStatsOverlay(false);
      }
      return;
    }

    // Otherwise open swap overlay
    setShowAddOverlay(true);
    setShowStatsOverlay(false);
  };

  // Open stats overlay for defense
  const onDefenseClick = (defense: ILeagueDefense) => {
    setShowStatsOverlay(true);
    setSelectedPlayer(null);
    setSelectedDefense(defense);
  };

  // Add an offensive player to the roster
  const onPlayerAdd = async (player: IPlayerData) => {
    setSelectedPlayer(player);
    setSelectedDefense(null);

    // Prevent duplicate adds
    if (selectedLeagueData?.players.some((p) => p.player.id === player.player.id)) {
      alert("Player is already on your roster for this league");
      return;
    }

    // Add immediately if space
    if (isSpaceRemainingForPlayerAtPosition(selectedLeagueData, selectedPosition)) {
      try {
        const payload = {
          leagueId: selectedLeagueData?.leagueId,
          memberId: player.player.id,
          isDefense: false
        };

        const res = await authFetch(
          `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/UpdateUserLeague/member`,
          { method: "POST", body: JSON.stringify(payload) }
        );

        if (!res.ok) throw new Error("Failed to add player");
        refreshUserData();
      } catch (e) {
        alert("Failed to add player to roster");
        console.error(e);
      } finally {
        setShowStatsOverlay(false);
      }
      return;
    }

    // Full position -> trigger swap overlay
    setShowAddOverlay(true);
    setShowStatsOverlay(false);
  };

  // Open stats overlay for player
  const onPlayerClick = (player: IPlayerData) => {
    setShowStatsOverlay(true);
    setSelectedDefense(null);
    setSelectedPlayer(player);
  };

  // Swap logic when roster is full
  const onPlayerSwapClick = async () => {
    try {
      const payload = {
        leagueId: selectedLeagueData?.leagueId,
        oldMemberId: selectedPlayerToSwap
          ? selectedPlayerToSwap.player.id
          : selectedDefenseToSwap?.team.id,
        oldIsDefense: selectedDefenseToSwap ? true : false,
        newMemberId: selectedPlayer ? selectedPlayer.player.id : selectedDefense?.team.id,
        newIsDefense: selectedDefense ? true : false
      };

      const res = await authFetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/UpdateUserLeague/member`,
        { method: "PUT", body: JSON.stringify(payload) }
      );

      if (!res.ok) throw new Error("Swap failed");
      refreshUserData();
    } catch (e) {
      alert("Player swap failed");
      console.error(e);
    } finally {
      // Clear selections and close overlays
      setShowAddOverlay(false);
      setSelectedPlayer(null);
      setSelectedDefense(null);
      setSelectedPlayerToSwap(null);
      setSelectedDefenseToSwap(null);
    }
  };

  // Apply search filter
  const filteredOffensivePlayers = offensivePlayers.filter(p =>
    p.player.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDefenses = defenses.filter(d =>
    d.team.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppNavWrapper title="LEAGUE STATS" button1={positionDropdown} button2={leagueDropdown}>
      {isLoading ? (
        <LoadingMessage message="Loading players..." />
      ) : (
        <>
          {/* Search bar */}
          <SearchBar
            value={searchQuery}
            placeholder="Search players..."
            onChange={setSearchQuery}
            sticky
          />

          {/* List players or defenses */}
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

      {/* Swap overlay */}
      {showAddOverlay &&
        <Overlay isOpen={showAddOverlay} onClose={() => setShowAddOverlay(false)}>
          <SelectPlayerOverlay ref={scrollContainerRef}>
            <StickyHeader>
              <SelectPlayerTitle className={headerFont.className}>
                Your roster is full
              </SelectPlayerTitle>
              <SelectPlayerSubtitle className={headerFont.className}>
                Select a player to swap out
              </SelectPlayerSubtitle>
            </StickyHeader>

            {/* Select which rostered player to swap */}
            <div style={{ padding: "2rem" }}>
              <PlayerList
                players={
                  selectedPosition !== "DEF"
                    ? selectedLeagueData?.players.filter((p) => {
                      const pos = p.player.position;

                      // Non-flex positions filter normally
                      if (!FLEX_ELIGIBLE.includes(selectedPosition)) {
                        return pos === selectedPosition;
                      }

                      // FLEX: only allow FLEX-eligible players
                      if (!FLEX_ELIGIBLE.includes(pos)) return false;

                      const maxPosSlots = getRosterSlotsByPosition(selectedLeagueData, pos);

                      // Count how many players of this position are picked
                      const pickedCount = selectedLeagueData.players.filter(
                        (pl) => pl.player.position === pos && pl.picked
                      ).length;

                      // Allow overflow players or matching-position swapping
                      if (pickedCount > maxPosSlots) return true;
                      if (p.player.position === selectedPlayer?.player.position) return true;

                      return false;
                    }) ?? []
                    : []
                }
                onPlayerClick={(player: IPlayerData) => {
                  // Toggle selection
                  if (selectedPlayerToSwap?.player.id === player.player.id) {
                    setSelectedPlayerToSwap(null);
                    return;
                  }
                  setSelectedPlayerToSwap(player);

                  // Scroll swap button into view
                  setTimeout(() => {
                    swapButtonRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
                  }, 50);
                }}
                defenses={selectedPosition === "DEF" ? selectedLeagueData?.defenses ?? [] : []}
                onDefenseClick={(defense: ILeagueDefense) => {
                  // Toggle selection
                  if (selectedDefenseToSwap?.team.id === defense.team.id) {
                    setSelectedDefenseToSwap(null);
                    return;
                  }
                  setSelectedDefenseToSwap(defense);

                  // Scroll button into view
                  setTimeout(() => {
                    swapButtonRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
                  }, 50);
                }}
                displayStartSit={false}
                selectable={true}
              />
            </div>

            {/* Swap button */}
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

      {/* Stats overlay for player/defense */}
      {showStatsOverlay &&
        <Overlay isOpen={showStatsOverlay} onClose={() => setShowStatsOverlay(false)}>
          {selectedPlayer &&
            <PlayerStatsOverlay player={selectedPlayer} onPlayerAdd={onPlayerAdd} />
          }
          {selectedDefense &&
            <DefenseStatsOverlay defense={selectedDefense} onAddDefense={onDefenseAdd} />
          }
        </Overlay>
      }
    </AppNavWrapper>
  );
}
