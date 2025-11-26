"use client";

import AppNavWrapper from "../../components/AppNavWrapper";
import { PrimaryColorButton, SecondaryColorButton } from "../../components/Buttons";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useUserData } from "@/app/context/UserDataProvider";
import { IAiAdviceResponse } from "@/app/interfaces/IAiAdviceResponse";
import LoadingMessage from "@/app/components/LoadingMessage";
import PlayerList from "@/app/components/PlayerList";
import { ILeagueDefense, IPlayerData } from "@/app/interfaces/IUserData";
import { getCachedAdvice, setCachedAdvice } from "@/lib/utils/cachedAdvice";
import styled from "styled-components";
import Overlay from "@/app/components/Overlay/Overlay";
import { PlayerPositionTag } from "@/app/components/PlayerList";
import { formatGameInfo, formatTeamGameInfo } from "@/lib/utils/formatGameInfo";
import { authFetch } from "@/lib/supabase/authFetch";

const StartSitLabel = styled.h2`
    font-size: 1.5rem;
    font-weight: bold;
    color: white;
    margin: 0.5rem 0;
`;

const OverlayContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  background-color: var(--color-base-dark-3);
  border-radius: var(--global-border-radius);
  color: white;
`;

const OverlayHeader = styled.div`
    position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  background-color: var(--color-base-dark-4);
  padding: 1rem;
  padding-bottom: 0;
  border-radius: var(--global-border-radius) var(--global-border-radius) 0 0;
  gap: 2rem;
`;

const PlayerImage = styled.img`
  height: 250px;
  object-fit: cover;
`;

const NameStack = styled.div`
  display: flex;
  flex-direction: column;

  h1 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: bold;
  }

  h2 {
    margin: 0;
    font-size: 1rem;
    color: var(--color-txt-3);
  }
`;

const OverlayBody = styled.div`
    padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;

  h3 {
    font-size: 1.15rem;
    font-weight: bold;
    margin-bottom: 1rem;
  }
`;

const PositionTagWrapper = styled.div`
  position: absolute;
  top: 1rem;
  left: 1rem;
`;

export default function DashboardPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const leagueId = searchParams.get("leagueId");
    const regenerate = searchParams.get("regenerate") === "true";

    const { userData, refreshUserData } = useUserData();
    const adviceCalledRef = useRef(false);

    const [advice, setAdvice] = useState<IAiAdviceResponse[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    // Overlay state
    const [selectedPlayer, setSelectedPlayer] = useState<IAiAdviceResponse | null>(null);
    const [selectedPlayerData, setSelectedPlayerData] = useState<IPlayerData | null>(null);
    const [selectedDefenseData, setSelectedDefenseData] = useState<ILeagueDefense | null>(null);
    const [showOverlay, setShowOverlay] = useState(false);

    useEffect(() => {
        if ((userData?.userInfo.tokens_left ?? 0) <= 0) {
            router.push("/dashboard");
        }
    }, [userData, router]);

    const league = userData?.leagues.find(l => l.leagueId === leagueId);

    useEffect(() => {
        if (!leagueId || adviceCalledRef.current || !league) return;
        if (!userData || (userData?.userInfo.tokens_left ?? 0) <= 0) return;

        setLoading(true);

        const userId = userData.userInfo.id;
        const playerIds = league.players.map(p => p.player.id);

        if (!regenerate) {
            const cached = getCachedAdvice(userId, leagueId, playerIds);
            if (cached) {
                setAdvice(cached);
                setLoading(false);
                return;
            }
        }

        adviceCalledRef.current = true;

        const generateAdvice = async () => {
            try {
                const res = await authFetch(
                    `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/RosterPrediction?leagueId=${leagueId}`,
                );

                const json = await res.json();
                const data: IAiAdviceResponse[] = Array.isArray(json.recommendations) ? json.recommendations : [];
                setAdvice(data);

                setCachedAdvice(userId, leagueId, playerIds, data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        generateAdvice();
    }, [leagueId, userData, regenerate]);

    // Step 1: Collect picked playerIds
    const pickedPlayerIds = new Set(advice.filter(a => a.picked).map(a => a.playerId));

    const startPlayers: IPlayerData[] = league?.players
        .filter(p => pickedPlayerIds.has(p.player.id))
        .map(p => ({ ...p, picked: true })) ?? [];

    const sitPlayers: IPlayerData[] = league?.players
        .filter(p => !pickedPlayerIds.has(p.player.id))
        .map(p => ({ ...p, picked: false })) ?? [];

    const pickedDefIds = new Set(advice.filter(a => a.picked && a.position === "DEF").map(a => a.playerId));

    const startDefs: ILeagueDefense[] = league?.defenses
        .filter(d => pickedDefIds.has(d.team.id))
        .map(d => ({ ...d, picked: true })) ?? [];

    const sitDefs: ILeagueDefense[] = league?.defenses
        .filter(d => !pickedDefIds.has(d.team.id))
        .map(d => ({ ...d, picked: false })) ?? [];

    const handlePlayerClick = (playerOrDef: IPlayerData | ILeagueDefense) => {
        let adviceItem: IAiAdviceResponse | undefined;

        if ("player" in playerOrDef) {
            // It's a player
            adviceItem = advice.find(a =>
                a.playerId === playerOrDef.player.id && a.picked === playerOrDef.picked
            );
            if (adviceItem) {
                setSelectedPlayer(adviceItem);
                setSelectedPlayerData(playerOrDef);
                setSelectedDefenseData(null);
                setShowOverlay(true);
            }
        } else if ("team" in playerOrDef) {
            // It's a defense
            adviceItem = advice.find(a =>
                a.position?.toUpperCase() === "DEF" &&
                a.playerId === playerOrDef.team.id &&
                a.picked === playerOrDef.picked
            );
            if (adviceItem) {
                setSelectedPlayer(adviceItem);
                setSelectedDefenseData(playerOrDef);
                setSelectedPlayerData(null);
                setShowOverlay(true);
            }
        }
    };

    const handleSaveRosterChanges = async () => {
        try {
            await Promise.all(
                advice.map((a) =>
                    authFetch(
                        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/UpdateUserLeague/pickedStatus`,
                        {
                            method: "PUT",
                            body: JSON.stringify({
                                league_id: leagueId,
                                member_id: a.playerId,
                                picked: a.picked,
                                is_defense: a.position === "DEF",
                            }),
                        }
                    )
                )
            );

            alert("Updated roster with AI advice!");
            refreshUserData();
        } catch (error) {
            console.error(error);
            alert("Some updates failed.");
        }
    }

    const saveRosterChangesButton = <PrimaryColorButton onClick={handleSaveRosterChanges}>Save Roster Changes</PrimaryColorButton>;
    const backButton = <SecondaryColorButton onClick={() => router.push("/dashboard")}>Back</SecondaryColorButton>;

    return (
        <AppNavWrapper title="AI ROSTER RECOMMENDATIONS" button1={saveRosterChangesButton} button2={backButton}>
            {loading && <LoadingMessage message="Loading AI roster recommendations..." />}

            {!loading && advice.length > 0 && (
                <>
                    <StartSitLabel>STARTERS</StartSitLabel>
                    <PlayerList
                        players={startPlayers}
                        defenses={startDefs}
                        onPlayerClick={handlePlayerClick}
                        onDefenseClick={handlePlayerClick}
                    />

                    <StartSitLabel>BENCH</StartSitLabel>
                    <PlayerList
                        players={sitPlayers}
                        defenses={sitDefs}
                        onPlayerClick={handlePlayerClick}
                        onDefenseClick={handlePlayerClick}
                    />
                </>
            )}

            {!loading && advice.length === 0 && <p>No advice available yet.</p>}

            {/* Overlay */}
            {showOverlay && selectedPlayer && (
                <Overlay isOpen={showOverlay} onClose={() => setShowOverlay(false)}>
                    <OverlayContentWrapper>
                        <OverlayHeader>
                            <PlayerImage
                                src={
                                    selectedPlayer.position !== "DEF"
                                        ? selectedPlayerData?.player.headshot_url ?? "default-player.png"
                                        : selectedDefenseData?.team.logo_url ?? "default-defense.png"
                                }
                                alt={
                                    selectedPlayer.position !== "DEF"
                                        ? selectedPlayerData?.player.name
                                        : selectedDefenseData?.team.name
                                }
                            />
                            <NameStack>
                                <h1>
                                    {selectedPlayer.position !== "DEF"
                                        ? selectedPlayerData?.player.name
                                        : selectedDefenseData?.team.name}
                                </h1>
                                {selectedPlayer.position !== "DEF" && (
                                    <>
                                        <h2>{`${selectedPlayerData?.player.team_id} ${formatGameInfo(selectedPlayerData?.game, selectedPlayerData?.player)}`}</h2>
                                        <h2>{selectedPlayerData?.player.status_description}</h2>
                                        {selectedPlayerData?.game && <>
                                            <h2>{selectedPlayerData?.game.stadium_name}</h2>
                                            <h2>{selectedPlayerData?.game.stadium_style}</h2>
                                        </>}
                                    </>
                                )}

                                {selectedPlayer.position === "DEF" && (
                                    <>
                                        <h2>{`${selectedDefenseData?.team.id} ${formatTeamGameInfo(selectedPlayerData?.game, selectedDefenseData ?? undefined)}`}</h2>
                                        {selectedDefenseData?.game && <>
                                            <h2>{selectedDefenseData?.game.stadium_name}</h2>
                                            <h2>{selectedDefenseData?.game.stadium_style}</h2>
                                        </>}
                                    </>
                                )}
                            </NameStack>
                            <PositionTagWrapper>
                                <PlayerPositionTag position={selectedPlayer.position}>
                                    {selectedPlayer.position}
                                </PlayerPositionTag>
                            </PositionTagWrapper>
                        </OverlayHeader>

                        <OverlayBody>
                            <div>
                                <h3>Status:</h3>
                                <p style={{ fontWeight: "bold", color: selectedPlayer.picked ? "var(--color-green)" : "var(--color-red)" }}>
                                    {selectedPlayer.picked ? "Start" : "Sit"}
                                </p>
                            </div>
                            <div>
                                <h3>Reasoning: </h3>
                                <p style={{ color: "var(--color-txt-2)" }}>
                                    {selectedPlayer.reasoning}
                                </p>
                            </div>
                        </OverlayBody>
                    </OverlayContentWrapper>
                </Overlay>
            )}
        </AppNavWrapper >
    );
}
