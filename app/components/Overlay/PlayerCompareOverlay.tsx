"use client";

import styled from "styled-components";
import Overlay from "./Overlay";
import SearchBar from "../SearchBar";
import PlayerList from "../PlayerList";
import { useState, useEffect } from "react";
import LoadingMessage from "../LoadingMessage";
import { useUserData } from "@/app/context/UserDataProvider";

import {
    IPlayerData,
    ILeagueDefense,
} from "@/app/interfaces/IUserData";

import { headerFont } from "@/app/localFont";
import { usePlayersByPosition } from "@/app/hooks/usePlayersByPosition";
import { PrimaryColorButton } from "../Buttons";

interface PlayerCompareOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    targetPlayer: IPlayerData | ILeagueDefense;
    onSelect: (compareWith: IPlayerData | ILeagueDefense) => void;
}

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  background-color: var(--color-base-dark);
  border-radius: var(--global-border-radius);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

const StickyHeader = styled.div`
  position: sticky;
  top: 0;
  background-color: var(--color-base-dark-4);
  z-index: 10;
  padding: 2rem;
`;

const Title = styled.h1`
  ${headerFont.className};
  text-align: center;
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1rem;
`;

const Content = styled.div`
  flex: 1;
  padding: 2rem;
`;

export default function PlayerCompareOverlay({
    isOpen,
    onClose,
    targetPlayer,
    onSelect,
}: PlayerCompareOverlayProps) {
    const { userData } = useUserData();
    const isDefense = "team" in targetPlayer;
    const position = isDefense ? "DEF" : targetPlayer.player.position;

    // Get unique ID for prevention of comparing against itself
    const targetId = isDefense ? targetPlayer.team.id : targetPlayer.player.id;

    // Load NFL players by position
    const { players, isLoading, refresh } = usePlayersByPosition(position);

    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState<IPlayerData | ILeagueDefense | null>(null);

    useEffect(() => {
        refresh();
    }, [position, refresh]);

    if (isLoading) {
        return (
            <Overlay isOpen={isOpen} onClose={onClose}>
                <Wrapper>
                    <LoadingMessage message="Loading..." />
                </Wrapper>
            </Overlay>
        );
    }

    let NFLDefenses: ILeagueDefense[] = [];
    let NFLPlayers: IPlayerData[] = [];

    if (players) {
        if (position === "DEF") {
            NFLDefenses = (players as unknown as ILeagueDefense[]).map(d => ({
                ...d,
                picked: false,
            }));
        } else {
            NFLPlayers = (players as unknown as IPlayerData[])
                .map(p => ({ ...p, picked: false }))
                .sort(
                    (a, b) =>
                        (b.seasonStats?.fantasy_points ?? 0) -
                        (a.seasonStats?.fantasy_points ?? 0)
                );
        }
    }


    const filteredPlayers = NFLPlayers.filter(p =>
        p.player.id !== targetId &&
        p.player.name.toLowerCase().includes(search.toLowerCase())
    );

    const filteredDefenses = NFLDefenses.filter(d =>
        d.team.id !== targetId &&
        d.team.name.toLowerCase().includes(search.toLowerCase())
    );

    const list = position === "DEF" ? filteredDefenses : filteredPlayers;

    const isPlayerType = (x: IPlayerData | ILeagueDefense | null): x is IPlayerData =>
        x !== null && "player" in x;
    const isDefenseType = (x: IPlayerData | ILeagueDefense | null): x is ILeagueDefense =>
        x !== null && "team" in x;

    return (
        <Overlay isOpen={isOpen} onClose={onClose}>
            {isOpen && (
                <Wrapper>
                    <StickyHeader>
                        <Title>Select a Player to Compare</Title>

                        <div style={{ display: "flex", width: "100%", alignItems: "center", gap: "1rem" }}>
                            <div style={{ flex: 1 }}>
                                <SearchBar
                                    value={search}
                                    onChange={setSearch}
                                    placeholder="Search players..."
                                    sticky={false}
                                    color="var(--color-base-dark-3)"
                                />
                            </div>

                            <PrimaryColorButton
                                disabled={!selected}
                                onClick={() => {
                                    const tokensRemaining = userData?.userInfo.tokens_left ?? 0;
                                    const confirmSpend = window.confirm(
                                        `Compare players for 1 token?\n\nYou currently have ${tokensRemaining} tokens.\nYou will have ${tokensRemaining - 1} remaining.`
                                    );
                                    if (!confirmSpend) return;
                                    return selected && onSelect(selected);
                                }}
                            >
                                Continue
                            </PrimaryColorButton>
                        </div>
                    </StickyHeader>

                    <Content>
                        <PlayerList
                            players={position === "DEF" ? [] : (list as IPlayerData[])}
                            defenses={position !== "DEF" ? [] : (list as ILeagueDefense[])}
                            displayStartSit={false}
                            selectable
                            onPlayerClick={(p) =>
                                setSelected(prev => (prev && "player" in prev && prev.player.id === p.player.id ? null : p))
                            }
                            onDefenseClick={(d) =>
                                setSelected(prev => (prev && "team" in prev && prev.team.id === d.team.id ? null : d))
                            }
                        />
                    </Content>
                </Wrapper>
            )}
        </Overlay>
    );
}
