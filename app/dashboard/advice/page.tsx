"use client";

import AppNavWrapper from "../../components/AppNavWrapper";
import { PrimaryColorButton, SecondaryColorButton } from "../../components/Buttons";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, Suspense } from "react";
import { useUserData } from "@/app/context/UserDataProvider";
import { IAiAdviceResponse } from "@/app/interfaces/IAiAdviceResponse";
import LoadingMessage from "@/app/components/LoadingMessage";
import PlayerList from "@/app/components/PlayerList";
import { ILeagueDefense, IPlayerData } from "@/app/interfaces/IUserData";
import { getCachedAdvice, setCachedAdvice } from "@/lib/utils/cachedAdvice";
import styled from "styled-components";
import { authFetch } from "@/lib/supabase/authFetch";
import AdviceReasoningOverlay from "@/app/components/Overlay/AdviceReasoningOverlay";

const StartSitLabel = styled.h2`
    font-size: 1.5rem;
    font-weight: bold;
    color: white;
    margin: 0.5rem 0;
`;

export default function AdvicePage() {
    return (
        <Suspense>
            <AdvicePageContent />
        </Suspense>
    );
}

function AdvicePageContent() {
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
    }, [leagueId, userData, regenerate, league]);

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
            {loading &&
                <LoadingMessage
                    intervalMs={1000}
                    messages={[
                        "Gathering player data...",
                        "Fetching league settings...",
                        "Analyzing recent performance trends...",
                        "Reviewing injury reports...",
                        "Evaluating defensive matchups...",
                        "Analyzing betting odds and implied totals...",
                        "Checking player utilization rates...",
                        "Reviewing red zone involvement...",
                        "Assessing expected game script...",
                        "Running predictive simulations...",
                        "Consulting the fantasy gods...",
                        "Double-checking matchup variables...",
                        "Filtering out noise from trends...",
                        "Making sure we're not biased by last week's boom game...",
                        "Finalizing recommendations...",
                        "Locking in the optimal choice...",
                        "Preparing results...",
                    ]}
                />}

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
                <AdviceReasoningOverlay
                    isOpen={showOverlay}
                    onClose={() => setShowOverlay(false)}
                    advice={selectedPlayer}
                    playerData={selectedPlayerData}
                    defenseData={selectedDefenseData}
                    leagueId={leagueId ?? ""}
                />
            )}
        </AppNavWrapper >
    );
}
