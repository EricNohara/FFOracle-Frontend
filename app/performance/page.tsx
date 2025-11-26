"use client";

import AppNavWrapper from "../components/AppNavWrapper";
import { useUserData } from "../context/UserDataProvider";
import { useState, useEffect } from "react";
import GenericDropdown from "../components/GenericDropdown";
import { createClient } from "@/lib/supabase/client";
import { ILeagueData } from "../interfaces/IUserData";
import { IPerformanceResponse, IWeeklyPerformance, IWeeklyPlayerPerformance } from "../interfaces/IPerformanceResponse";
import { PerformanceTable } from "../components/PerformanceTable";
import LoadingMessage from "../components/LoadingMessage";
import styled from "styled-components";

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

export default function PerformancePage() {
    const { userData } = useUserData();
    const supabase = createClient();
    const [selectedLeagueData, setSelectedLeagueData] = useState<ILeagueData | null>(null);
    const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
    const [performance, setPerformance] = useState<IPerformanceResponse | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const players = selectedLeagueData?.players ?? [];
    const hasPlayers = players.length > 0;

    const availableWeeks = hasPlayers
        ? Array.from(
            new Set(players.flatMap((p) => p.weeklyStats?.map((ws) => ws.week) ?? []))
        ).sort((a, b) => a - b)
        : [];

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
    }, [selectedLeagueData]);

    useEffect(() => {
        if (!selectedLeagueData || selectedWeek === null) return;

        const fetcher = async () => {
            setIsLoading(true);
            try {
                const { data: sessionData } = await supabase.auth.getSession();
                const accessToken = sessionData?.session?.access_token;
                if (!accessToken) throw new Error("User not authenticated");

                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/LeaguePerformance/${selectedLeagueData.leagueId}/week/${selectedWeek}`,
                    { headers: { Authorization: `Bearer ${accessToken}` } }
                );

                if (!res.ok) {
                    setPerformance(null);
                    return;
                }

                const data: IPerformanceResponse = await res.json();
                setPerformance(data);
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

    const playerNameMap = Object.fromEntries(players.map((p) => [p.player.id, p.player.name]));
    const playerPositionMap = Object.fromEntries(players.map((p) => [p.player.id, p.player.position]));
    const playerHeadshotMap = Object.fromEntries(players.map((p) => [p.player.id, p.player.headshot_url]));

    const positionOrder = ["QB", "RB", "WR", "TE", "K"];

    const playerRowsWithNames: (
        IWeeklyPlayerPerformance & {
            playerName: string;
            position: string;
            headshotUrl: string | null;
        }
    )[] =
        (performance?.playerPerformance || [])
            .map((p) => ({
                ...p,
                playerName: playerNameMap[p.playerId] ?? p.playerId,
                position: playerPositionMap[p.playerId] ?? "UNK",
                headshotUrl: playerHeadshotMap[p.playerId] ?? null,
            }))
            .sort((a, b) => {
                const posA = positionOrder.indexOf(a.position);
                const posB = positionOrder.indexOf(b.position);
                const orderA = posA === -1 ? 999 : posA;
                const orderB = posB === -1 ? 999 : posB;
                if (orderA !== orderB) return orderA - orderB;
                return a.overallRank - b.overallRank;
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