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

// Container for stacked tables
const TablesContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 2rem;
`;

// A flexible pane for each table
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

    // League, week, and fetched data
    const [selectedLeagueData, setSelectedLeagueData] = useState<ILeagueData | null>(null);
    const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
    const [performance, setPerformance] = useState<IPerformanceResponse | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // Map from playerId → basic info
    const [playerInfoMap, setPlayerInfoMap] = useState<Record<string, BasicPlayerInfo>>({});

    // Convenience reference to current league players
    const players = useMemo(
        () => selectedLeagueData?.players ?? [],
        [selectedLeagueData]
    );

    const hasPlayers = players.length > 0;

    // Helper function to fetch minimal player info (name, headshot, position)
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

    // Compute which weeks have stats available
    const availableWeeks = useMemo(() => {
        if (!hasPlayers) return [];

        return Array.from(
            new Set(
                players.flatMap(p => p.weeklyStats?.map(ws => ws.week) ?? [])
            )
        ).sort((a, b) => a - b);
    }, [hasPlayers, players]);

    // Default selected league is the user's first league
    useEffect(() => {
        if (userData?.leagues && userData.leagues.length > 0) {
            setSelectedLeagueData(userData.leagues[0]);
        }
    }, [userData]);

    // Default week = latest available
    useEffect(() => {
        if (availableWeeks.length > 0) {
            setSelectedWeek(availableWeeks[availableWeeks.length - 1]);
        } else {
            setSelectedWeek(null);
        }
    }, [selectedLeagueData, availableWeeks]);

    // Fetch performance data whenever week or league changes
    useEffect(() => {
        if (!selectedLeagueData || selectedWeek === null) return;

        const fetcher = async () => {
            setIsLoading(true);

            try {
                // Fetch league's full performance summary for this week
                const res = await authFetch(
                    `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/LeaguePerformance/${selectedLeagueData.leagueId}/week/${selectedWeek}`
                );

                if (!res.ok) {
                    setPerformance(null);
                    return;
                }

                const data: IPerformanceResponse = await res.json();
                setPerformance(data);

                // Build list of involved playerIds
                const playerIds = data.playerPerformance.map(p => p.playerId);

                // Fetch name/headshot/position for rows
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

    // No leagues at all
    if (!userData?.leagues?.length) {
        return (
            <AppNavWrapper title="PERFORMANCE">
                <p style={{ color: "var(--color-txt-3)" }}>You have no leagues yet.</p>
            </AppNavWrapper>
        );
    }

    // Dropdowns
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

    // League exists but contains no players
    if (!hasPlayers) {
        return (
            <AppNavWrapper title="PERFORMANCE" button1={leagueDropdown}>
                <p style={{ color: "var(--color-txt-3)" }}>
                    This league has no players yet. Add players to view performance.
                </p>
            </AppNavWrapper>
        );
    }

    // No weekly stats yet
    if (availableWeeks.length === 0) {
        return (
            <AppNavWrapper title="PERFORMANCE" button1={leagueDropdown}>
                <p style={{ color: "var(--color-txt-3)" }}>
                    No weekly performance data available yet.
                </p>
            </AppNavWrapper>
        );
    }

    // Sort order for player table rows
    const positionOrder = ["QB", "RB", "WR", "TE", "K"];

    // Merge performance stats + player info into display rows
    const playerRowsWithNames =
        (performance?.playerPerformance || [])
            .map((p) => {
                const info = playerInfoMap[p.playerId];

                return {
                    ...p,
                    playerName: info?.name ?? p.playerId,
                    position: info?.position ?? "UNK",
                    headshotUrl: info?.headshot_url ?? null,
                };
            })
            // Sort by position group first, then by overallRank within group
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
                    {/* Player performance table */}
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

                    {/* League performance history table */}
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