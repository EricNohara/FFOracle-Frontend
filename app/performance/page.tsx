"use client";

import AppNavWrapper from "../components/AppNavWrapper";
import { useUserData } from "../context/UserDataProvider";
import { useState, useEffect, useMemo } from "react";
import GenericDropdown from "../components/GenericDropdown";
import { ILeagueData } from "../interfaces/IUserData";
import { IPerformanceResponse, IWeeklyPerformance, IWeeklyPlayerPerformance } from "../interfaces/IPerformanceResponse";
import { PerformanceTable } from "../components/PerformanceTable";
import LoadingMessage from "../components/LoadingMessage";
import styled from "styled-components";
import { authFetch } from "@/lib/supabase/authFetch";

const TablesContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 2rem;
`;

const TablePane = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
`;

type BasicPlayerInfo = {
    id: string;
    name: string;
    position: string;
    headshot_url: string | null;
};

export default function PerformancePage() {
    const { userData } = useUserData();
    const [selectedLeagueData, setSelectedLeagueData] = useState<ILeagueData | null>(null);
    const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
    const [performance, setPerformance] = useState<IPerformanceResponse | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [playerInfoMap, setPlayerInfoMap] = useState<Record<string, BasicPlayerInfo>>({});

    const players = useMemo(
        () => selectedLeagueData?.players ?? [],
        [selectedLeagueData]
    );
    const hasPlayers = players.length > 0;

    // helper function to get basic player info from their ids used to display their rows
    async function fetchBasicPlayerInfo(playerIds: string[]) {
        const res = await authFetch(
            `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/Players/basic`,
            {
                method: "POST",
                body: JSON.stringify({ ids: playerIds })
            }
        );

        if (!res.ok) return [];
        return await res.json();
    }

    const availableWeeks = useMemo(() => {
        if (!hasPlayers) return [];

        return Array.from(
            new Set(
                players.flatMap((p) => p.weeklyStats?.map((ws) => ws.week) ?? [])
            )
        ).sort((a, b) => a - b);

    }, [hasPlayers, players]);


    useEffect(() => {
        if (userData?.leagues && userData.leagues.length > 0) {
            setSelectedLeagueData(userData.leagues[0]);
        }
    }, [userData]);

    useEffect(() => {
        if (availableWeeks.length > 0) {
            setSelectedWeek(availableWeeks[availableWeeks.length - 1]);
        } else {
            setSelectedWeek(null);
        }
    }, [selectedLeagueData, availableWeeks]);

    useEffect(() => {
        if (!selectedLeagueData || selectedWeek === null) return;

        const fetcher = async () => {
            setIsLoading(true);
            try {
                const res = await authFetch(
                    `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/LeaguePerformance/${selectedLeagueData.leagueId}/week/${selectedWeek}`);

                if (!res.ok) {
                    setPerformance(null);
                    return;
                }

                const data: IPerformanceResponse = await res.json();
                setPerformance(data);

                // get player names and headshot urls from their ids
                const playerIds = data.playerPerformance.map(p => p.playerId);

                if (playerIds.length > 0) {
                    const info = await fetchBasicPlayerInfo(playerIds);

                    const map: Record<string, BasicPlayerInfo> = {};
                    info.forEach((p: BasicPlayerInfo) => {
                        map[p.id] = {
                            id: p.id,
                            name: p.name,
                            headshot_url: p.headshot_url ?? null,
                            position: p.position ?? "UNK"
                        };
                    });



                    setPlayerInfoMap(map);
                }
            } catch {
                setPerformance(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetcher();
    }, [selectedWeek, selectedLeagueData]);

    if (!userData?.leagues?.length) {
        return (
            <AppNavWrapper title="PERFORMANCE">
                <p style={{ color: "var(--color-txt-3)" }}>You have no leagues yet.</p>
            </AppNavWrapper>
        );
    }

    // dropdown selections
    const leagueDropdown = (
        <GenericDropdown
            items={userData?.leagues ?? []}
            selected={selectedLeagueData}
            getKey={(l) => l.leagueId}
            getLabel={(l) => l.leagueName}
            onChange={(league) => setSelectedLeagueData(league)}
        />
    );

    const weekDropdown = (
        <GenericDropdown
            items={availableWeeks}
            selected={selectedWeek}
            getKey={(week) => `Week ${week}`}
            getLabel={(week) => `Week ${week}`}
            onChange={(week) => setSelectedWeek(week)}
        />
    );

    // fallbacks for when there is no performance data available
    if (!hasPlayers) {
        return (
            <AppNavWrapper title="PERFORMANCE" button1={leagueDropdown}>
                <p style={{ color: "var(--color-txt-3)" }}>
                    This league has no players yet. Add players to view performance.
                </p>
            </AppNavWrapper>
        );
    }

    if (availableWeeks.length === 0) {
        return (
            <AppNavWrapper title="PERFORMANCE" button1={leagueDropdown}>
                <p style={{ color: "var(--color-txt-3)" }}>
                    No weekly performance data available yet.
                </p>
            </AppNavWrapper>
        );
    }

    const positionOrder = ["QB", "RB", "WR", "TE", "K"];

    // construct the player rows from their performance stats and their name, position, and headshot urls
    const playerRowsWithNames =
        (performance?.playerPerformance || [])
            .map((p) => {
                const info = playerInfoMap[p.playerId];

                return {
                    ...p,
                    playerName: info?.name ?? p.playerId,
                    position: info?.position ?? "UNK", // optional if needed
                    headshotUrl: info?.headshot_url ?? null,
                };
            })
            .sort((a, b) => {
                const posA = positionOrder.indexOf(a.position);
                const posB = positionOrder.indexOf(b.position);
                return (posA - posB || a.overallRank - b.overallRank);
            });


    return (
        <AppNavWrapper title="PERFORMANCE" button1={leagueDropdown} button2={weekDropdown}>
            {isLoading ? (
                <LoadingMessage message="Loading performance data..." />
            ) : (
                <TablesContainer>
                    <TablePane>
                        <PerformanceTable<
                            IWeeklyPlayerPerformance & {
                                playerName: string;
                                position: string;
                                headshotUrl: string | null;
                            }
                        >
                            title="PLAYER PERFORMANCE"
                            columns={[
                                { key: "position", label: "Pos" },
                                { key: "playerName", label: "Player" },
                                { key: "actualFpts", label: "Actual FPTS" },
                                { key: "picked", label: "Picked" },
                                { key: "positionRank", label: "Position Rank" },
                                { key: "overallRank", label: "Overall Rank" },
                            ]}
                            data={playerRowsWithNames}
                        />
                    </TablePane>

                    <TablePane>
                        <PerformanceTable<IWeeklyPerformance>
                            columns={[
                                { key: "week", label: "Week" },
                                { key: "actualFpts", label: "Actual FPTS" },
                                { key: "maxFpts", label: "Max FPTS" },
                                { key: "accuracy", label: "Accuracy (%)" },
                            ]}
                            data={performance?.leaguePerformance || []}
                            title="LEAGUE PERFORMANCE HISTORY"
                        />
                    </TablePane>
                </TablesContainer>
            )}
        </AppNavWrapper>
    );
}