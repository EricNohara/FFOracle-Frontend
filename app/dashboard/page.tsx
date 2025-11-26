"use client";

import AppNavWrapper from "../components/AppNavWrapper";
import { PrimaryColorButton } from "../components/Buttons";
import { useRouter } from "next/navigation";
import { useUserData } from "../context/UserDataProvider";
import { useEffect, useState } from "react";
import { ILeagueData, ILeagueDefense, IPlayerData } from "../interfaces/IUserData";
import styled from "styled-components";
import PlayerList from "../components/PlayerList";
import PlayerStatsOverlay from "../components/Overlay/PlayerStatsOverlay";
import Overlay from "../components/Overlay/Overlay";
import DefenseStatsOverlay from "../components/Overlay/DefenseStatsOverlay";
import GenericDropdown from "../components/GenericDropdown";
import { authFetch } from "@/lib/supabase/authFetch";
import { getCachedAdvice } from "@/lib/utils/cachedAdvice";
import ConfirmAdviceModal from "../components/Overlay/ConfirmAdviceModal";
import ConfirmSwapModal from "../components/Overlay/ConfirmSwapModal";

const NoDataMessage = styled.p`
    font-style: italic;
    color: var(--color-txt-3);
`;

export default function DashboardPage() {
    const router = useRouter();
    const { userData, refreshUserData } = useUserData();
    const [selectedLeagueData, setSelectedLeagueData] = useState<ILeagueData | null>(null);
    const [showOverlay, setShowOverlay] = useState<boolean>(false);
    const [selectedPlayer, setSelectedPlayer] = useState<IPlayerData | null>(null);
    const [selectedDefense, setSelectedDefense] = useState<ILeagueDefense | null>(null);
    const [showAdviceModal, setShowAdviceModal] = useState(false);
    const [showSwapModal, setShowSwapModal] = useState(false);
    const [swapTarget, setSwapTarget] = useState<IPlayerData | ILeagueDefense | null>(null);

    // Set default selected league on load (first one)
    useEffect(() => {
        if (userData?.leagues && userData.leagues.length > 0) {
            setSelectedLeagueData(userData.leagues[0]);
        }
    }, [userData]);

    const handleUseCached = () => {
        setShowAdviceModal(false);
        router.push(`/dashboard/advice?leagueId=${selectedLeagueData?.leagueId}&regenerate=false`);
    };

    const handleRegenerate = () => {
        setShowAdviceModal(false);
        router.push(`/dashboard/advice?leagueId=${selectedLeagueData?.leagueId}&regenerate=true`);
    };

    const handleClickAdvice = () => {
        const tokensRemaining = userData?.userInfo.tokens_left ?? 0;
        const name = userData?.userInfo.fullname ?? "";
        const league = selectedLeagueData;

        if (!league) {
            alert("No league selected.");
            return;
        }

        const userId = userData?.userInfo.id;
        const playerIds = league.players.map(p => p.player.id);

        // check cache
        const cached = getCachedAdvice(userId ?? "", league.leagueId, playerIds);

        if (cached) {
            setShowAdviceModal(true);
            return;
        }

        // otherwise must confirm token spend
        if (tokensRemaining <= 0) {
            alert(`User ${name} has ${tokensRemaining} tokens remaining. Purchase more tokens.`);
            return;
        }

        const confirmSpend = window.confirm(
            `Generate new AI advice for ${league.leagueName}? This costs 1 token.\n\n` +
            `You currently have ${tokensRemaining} tokens.\n` +
            `You will have ${tokensRemaining - 1} remaining.`
        );

        if (!confirmSpend) return;

        router.push(`/dashboard/advice?leagueId=${league.leagueId}`);
    };


    const editButton = <PrimaryColorButton onClick={() => router.push(`/stats?leagueId=${selectedLeagueData?.leagueId}`)}>Edit Roster</PrimaryColorButton>;
    const adviceButton = <PrimaryColorButton onClick={handleClickAdvice}>Generate Advice</PrimaryColorButton>;

    // Secondary "button" as dropdown
    const leagueDropdown = (
        <GenericDropdown
            items={userData?.leagues ?? []}
            selected={selectedLeagueData}
            getKey={(l) => l.leagueId}
            getLabel={(l) => l.leagueName}
            onChange={(league) => setSelectedLeagueData(league)}
        />
    );

    const onPlayerClick = (player: IPlayerData) => {
        setShowOverlay(true);
        setSelectedDefense(null);
        setSelectedPlayer(player);
    }

    const onDefenseClick = (defense: ILeagueDefense) => {
        setShowOverlay(true);
        setSelectedPlayer(null);
        setSelectedDefense(defense);
    }

    const onPlayerDelete = async (player: IPlayerData) => {
        try {
            // construct payload for player/defense updates
            const payload = {
                leagueId: selectedLeagueData?.leagueId,
                memberId: player?.player.id,
                isDefense: false
            };

            const res = await authFetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/UpdateUserLeague/member`, {
                method: "DELETE",
                body: JSON.stringify(payload)
            })

            if (!res.ok) throw new Error();

            refreshUserData();
            setShowOverlay(false);
        } catch (e) {
            alert("Failed to delete player from your league's roster");
            console.error(e);
        }
    }

    const onDefenseDelete = async (defense: ILeagueDefense) => {
        try {
            // construct payload for player/defense updates
            const payload = {
                leagueId: selectedLeagueData?.leagueId,
                memberId: defense.team.id,
                isDefense: true
            };

            const res = await authFetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/UpdateUserLeague/member`,
                {
                    method: "DELETE",
                    body: JSON.stringify(payload)
                });

            if (!res.ok) throw new Error();

            refreshUserData();
            setShowOverlay(false);
        } catch (e) {
            alert("Failed to delete defense from your league's roster");
            console.error(e);
        }
    }

    const handleToggleStartSit = (playerOrDefense: IPlayerData | ILeagueDefense) => {
        setSwapTarget(playerOrDefense);
        setShowSwapModal(true);
    };

    const handleConfirmStartSit = async () => {
        if (!swapTarget || !selectedLeagueData) return;

        try {
            const res = await authFetch(
                `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/UpdateUserLeague/pickedStatus`,
                {
                    method: "PUT",
                    body: JSON.stringify({
                        league_id: selectedLeagueData.leagueId,
                        member_id: "player" in swapTarget
                            ? swapTarget.player.id        // player
                            : swapTarget.team.id,         // defense
                        picked: !swapTarget.picked,       // flip start/sit
                        is_defense: !("player" in swapTarget)
                    }),
                }
            );

            if (!res.ok) throw new Error("Failed to update picked status");

            // update UI after server updates
            await refreshUserData();
            setShowSwapModal(false);
            setSwapTarget(null);
        } catch (error) {
            console.error("Error swapping start/sit:", error);
            alert("Failed to update lineup.");
        }
    };

    return (
        <AppNavWrapper title="ROSTER DASHBOARD" button1={(selectedLeagueData?.players?.length ?? 0) > 0 ? adviceButton : editButton} button2={leagueDropdown}>
            {selectedLeagueData ?
                ((selectedLeagueData.players?.length ?? 0) > 0 || (selectedLeagueData.defenses?.length ?? 0) > 0) ?
                    (
                        <PlayerList
                            players={selectedLeagueData.players ?? []}
                            onPlayerClick={onPlayerClick}
                            defenses={selectedLeagueData.defenses ?? []}
                            onDefenseClick={onDefenseClick}
                            onToggleStartSit={handleToggleStartSit}
                        />
                    ) : <NoDataMessage>Your roster is empty. Click edit roster to add players to your roster for this league.</NoDataMessage>
                : (
                    <NoDataMessage>No league selected</NoDataMessage>
                )}

            {/* overlay */}
            {
                showOverlay &&
                <Overlay isOpen={showOverlay} onClose={() => setShowOverlay(false)}>
                    {selectedPlayer && <PlayerStatsOverlay player={selectedPlayer} onPlayerDelete={onPlayerDelete} />}
                    {selectedDefense && <DefenseStatsOverlay defense={selectedDefense} onDeleteDefense={onDefenseDelete} />}
                </Overlay>
            }
            <ConfirmAdviceModal
                isOpen={showAdviceModal}
                onClose={() => setShowAdviceModal(false)}
                onUseCached={handleUseCached}
                onRegenerate={handleRegenerate}
            />
            <ConfirmSwapModal
                isOpen={showSwapModal}
                target={swapTarget}
                onClose={() => setShowSwapModal(false)}
                onConfirm={handleConfirmStartSit}
            />
        </AppNavWrapper>
    )
}