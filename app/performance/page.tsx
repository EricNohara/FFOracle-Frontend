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
    const [selectedWeek, setSelectedWeek] = useState<number>(1);
    const [performance, setPerformance] = useState<IPerformanceResponse | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        if (userData?.leagues && userData.leagues.length > 0) {
            setSelectedLeagueData(userData.leagues[0]);
        }
    }, [userData]);

    useEffect(() => {
        if (!selectedLeagueData) return;

        // calculate the max week for any player's weekly stats in your league
        const maxWeek = Math.max(
            1,
            ...selectedLeagueData.players.flatMap(player =>
                player.weeklyStats?.map(ws => ws.week) ?? []
            )
        );

        setSelectedWeek(maxWeek);
    }, [selectedLeagueData])

    useEffect(() => {
        if (!selectedLeagueData) return;

        const fetcher = async () => {
            setIsLoading(true);
            try {
                // get the session
                const { data: sessionData } = await supabase.auth.getSession();
                const accessToken = sessionData?.session?.access_token;
                if (!accessToken) throw new Error("User not authenticated");

                const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/LeaguePerformance/${selectedLeagueData.leagueId}/week/${selectedWeek}`,
                    { headers: { "Authorization": `Bearer ${accessToken}`, } }
                );

                if (!res.ok) throw new Error();
                const data: IPerformanceResponse = await res.json();
                setPerformance(data);
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        }

        fetcher();
    }, [selectedWeek])

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
            items={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]}
            selected={selectedWeek}
            getKey={(week) => `Week ${week}`}
            getLabel={(week) => `Week ${week}`}
            onChange={(week) => setSelectedWeek(week)}
        />
    );

    const playerNameMap = selectedLeagueData
        ? Object.fromEntries(
            selectedLeagueData.players.map((p) => [p.player.id, p.player.name])
        )
        : {};

    const playerPositionMap = selectedLeagueData
        ? Object.fromEntries(
            selectedLeagueData.players.map((p) => [p.player.id, p.player.position])
        )
        : {};

    const playerHeadshotMap = selectedLeagueData
        ? Object.fromEntries(
            selectedLeagueData.players.map((p) => [
                p.player.id,
                p.player.headshot_url
            ])
        )
        : {};

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

                // fallback for unknown positions
                const orderA = posA === -1 ? 999 : posA;
                const orderB = posB === -1 ? 999 : posB;

                // first sort by position order, then by overall rank inside each group
                if (orderA !== orderB) return orderA - orderB;
                return a.overallRank - b.overallRank;
            });

    return (
        <AppNavWrapper title="PERFORMANCE" button1={leagueDropdown} button2={weekDropdown}>
            {isLoading ?
                <LoadingMessage message="Loading performance data..." /> :
                <TablesContainer>
                    <TablePane>
                        <PerformanceTable<
                            IWeeklyPlayerPerformance & { playerName: string; position: string; headshotUrl: string | null }
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
            }
        </AppNavWrapper>
    )
}