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
import { canDefenseStartAtPosition, canPlayerStartAtPosition, getPlayersToSwapForNewStarter } from "@/lib/utils/rosterSlots";
import SwapSelectionModal from "../components/Overlay/SwapSelectionModal";
import AddLeagueOverlay from "../components/Overlay/AddLeagueOverlay";
import DashboardTour from "../components/Tour/DashboardTour";

// Styled component for roster empty message
const NoDataMessage = styled.p`
    font-style: italic;
    color: var(--color-txt-3);
`;

export default function DashboardPage() {
    const router = useRouter();
    const { userData, refreshUserData } = useUserData();

    // Main league selection state
    const [selectedLeagueData, setSelectedLeagueData] = useState<ILeagueData | null>(null);

    // Overlay and modal states
    const [showOverlay, setShowOverlay] = useState<boolean>(false);
    const [selectedPlayer, setSelectedPlayer] = useState<IPlayerData | null>(null);
    const [selectedDefense, setSelectedDefense] = useState<ILeagueDefense | null>(null);

    const [showAdviceModal, setShowAdviceModal] = useState(false);
    const [showSwapModal, setShowSwapModal] = useState(false);
    const [swapTarget, setSwapTarget] = useState<IPlayerData | ILeagueDefense | null>(null);
    const [swapChoices, setSwapChoices] = useState<(IPlayerData | ILeagueDefense)[]>([]);
    const [showSwapSelectionModal, setShowSwapSelectionModal] = useState(false);
    const [showAddLeagueModal, setShowAddLeagueModal] = useState(false);

    // Select first league by default when user data loads
    useEffect(() => {
        if (userData?.leagues && userData.leagues.length > 0) {
            setSelectedLeagueData(userData.leagues[0]);
        }
    }, [userData]);

    // Use cached advice instead of regenerating
    const handleUseCached = () => {
        setShowAdviceModal(false);
        router.push(`/dashboard/advice?leagueId=${selectedLeagueData?.leagueId}&regenerate=false`);
    };

    // Force regeneration of advice
    const handleRegenerate = () => {
        setShowAdviceModal(false);
        router.push(`/dashboard/advice?leagueId=${selectedLeagueData?.leagueId}&regenerate=true`);
    };

    // Advice button logic (cache check, token check, confirm spend)
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

        // Check local cache first
        const cached = getCachedAdvice(userId ?? "", league.leagueId, playerIds);
        if (cached) {
            setShowAdviceModal(true);
            return;
        }

        // No cached advice -> token check
        if (tokensRemaining <= 10) {
            alert(`User ${name} has ${tokensRemaining} tokens remaining. Purchase more tokens.`);
            return;
        }

        const confirmSpend = window.confirm(
            `Generate new AI advice for ${league.leagueName} for 10 tokens?\n\n` +
            `You currently have ${tokensRemaining} tokens.\n` +
            `You will have ${tokensRemaining - 10} remaining.`
        );

        if (!confirmSpend) return;

        // Navigate to generate fresh advice
        router.push(`/dashboard/advice?leagueId=${league.leagueId}&regenerate=true`);
    };

    // Primary top buttons
    const editButton = (
        <PrimaryColorButton
            id="edit-button"
            onClick={() => router.push(`/stats?leagueId=${selectedLeagueData?.leagueId}`)}
        >
            Edit Roster
        </PrimaryColorButton>
    );

    const adviceButton = (
        <PrimaryColorButton
            id="advice-button"
            onClick={handleClickAdvice}
        >
            Generate Advice
        </PrimaryColorButton>
    );

    const addLeagueButton = (
        <PrimaryColorButton
            id="add-league-button"
            onClick={() => {
                // Set onboarding state and open modal
                const key = `onboarding-stage-${userData?.userInfo.id}`;
                localStorage.setItem(key, "after-create");

                // Stop tour if running
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const t = (window as any)._shepherdTour;
                if (t) t.cancel();

                setShowAddLeagueModal(true);
            }}
        >
            Add League
        </PrimaryColorButton >
    );

    // Dropdown of user's leagues
    const leagueDropdown = (
        <GenericDropdown
            id="league-dropdown"
            items={userData?.leagues ?? []}
            selected={selectedLeagueData}
            getKey={(l) => l.leagueId}
            getLabel={(l) => l.leagueName}
            onChange={(league) => setSelectedLeagueData(league)}
        />
    );

    // Open overlay for player
    const onPlayerClick = (player: IPlayerData) => {
        setShowOverlay(true);
        setSelectedDefense(null);
        setSelectedPlayer(player);
    };

    // Open overlay for defense
    const onDefenseClick = (defense: ILeagueDefense) => {
        setShowOverlay(true);
        setSelectedPlayer(null);
        setSelectedDefense(defense);
    };

    // Delete player from roster
    const onPlayerDelete = async (player: IPlayerData) => {
        try {
            const payload = {
                leagueId: selectedLeagueData?.leagueId,
                memberId: player?.player.id,
                isDefense: false
            };

            const res = await authFetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/UpdateUserLeague/member`, {
                method: "DELETE",
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error();

            refreshUserData();
            setShowOverlay(false);
        } catch (e) {
            alert("Failed to delete player from your league's roster");
            console.error(e);
        }
    };

    // Delete defense from roster
    const onDefenseDelete = async (defense: ILeagueDefense) => {
        try {
            const payload = {
                leagueId: selectedLeagueData?.leagueId,
                memberId: defense.team.id,
                isDefense: true
            };

            const res = await authFetch(
                `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/UpdateUserLeague/member`,
                {
                    method: "DELETE",
                    body: JSON.stringify(payload)
                }
            );

            if (!res.ok) throw new Error();

            refreshUserData();
            setShowOverlay(false);
        } catch (e) {
            alert("Failed to delete defense from your league's roster");
            console.error(e);
        }
    };

    // Trigger swap/start-sit modal
    const handleToggleStartSit = (playerOrDefense: IPlayerData | ILeagueDefense) => {
        setSwapTarget(playerOrDefense);
        setShowSwapModal(true);
    };

    // Logic when confirming start/sit change
    const handleConfirmStartSit = async () => {
        if (!swapTarget || !selectedLeagueData) return;

        const isPlayer = "player" in swapTarget;

        // Trying to START a currently benched player
        if (swapTarget.picked === false) {
            let canStart = true;
            let choices: (IPlayerData | ILeagueDefense)[] = [];

            if (isPlayer) {
                canStart = canPlayerStartAtPosition(
                    selectedLeagueData,
                    swapTarget.player.position
                );

                if (!canStart) {
                    choices = getPlayersToSwapForNewStarter(
                        selectedLeagueData,
                        swapTarget.player.position
                    );
                }

            } else {
                canStart = canDefenseStartAtPosition(selectedLeagueData);

                if (!canStart) {
                    choices = selectedLeagueData.defenses.filter(d => d.picked);
                }
            }

            // Cannot start directly, show swap options
            if (!canStart) {
                setSwapChoices(choices);
                setShowSwapModal(false);
                setShowSwapSelectionModal(true);
                return;
            }
        }

        // Start or sit toggle is allowed → perform it
        await performPickedSwap(swapTarget);
    };

    // Perform actual PUT request to update picked status
    const performPickedSwap = async (target: IPlayerData | ILeagueDefense) => {
        try {
            const res = await authFetch(
                `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/UpdateUserLeague/pickedStatus`,
                {
                    method: "PUT",
                    body: JSON.stringify({
                        league_id: selectedLeagueData!.leagueId,
                        member_id: "player" in target ? target.player.id : target.team.id,
                        picked: !target.picked,
                        is_defense: !("player" in target),
                    }),
                }
            );

            if (!res.ok) throw new Error();

            await refreshUserData();
            setShowSwapModal(false);
            setShowSwapSelectionModal(false);
            setSwapTarget(null);
        } catch (err) {
            console.error(err);
            alert("Failed to update lineup.");
        }
    };

    // Creates a new league
    const handleCreateLeague = async (payload: unknown) => {
        try {
            const res = await authFetch(
                `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/UpdateUserLeague/createLeague`,
                {
                    method: "POST",
                    body: JSON.stringify(payload),
                }
            );

            if (!res.ok) throw new Error("Failed to create league");

            await refreshUserData();
        } catch (err) {
            console.error(err);
            alert("Error creating league");
        }
    };

    return (
        <AppNavWrapper
            title="ROSTER DASHBOARD"
            button1={(selectedLeagueData?.players?.length ?? 0) > 0 ? adviceButton : editButton}
            button2={leagueDropdown}
            button3={addLeagueButton}
        >
            {/* Guided onboarding tour */}
            <DashboardTour
                userId={userData?.userInfo.id}
                hasLeagues={(userData?.leagues?.length ?? 0) > 0}
            />

            {/* Main roster display */}
            {selectedLeagueData ?
                ((selectedLeagueData.players?.length ?? 0) > 0 ||
                    (selectedLeagueData.defenses?.length ?? 0) > 0) ?
                    (
                        <PlayerList
                            players={selectedLeagueData.players ?? []}
                            onPlayerClick={onPlayerClick}
                            defenses={selectedLeagueData.defenses ?? []}
                            onDefenseClick={onDefenseClick}
                            onToggleStartSit={handleToggleStartSit}
                        />
                    ) : (
                        <NoDataMessage>
                            Your roster is empty. Click edit roster to add players to your roster for this league.
                        </NoDataMessage>
                    )
                : <NoDataMessage>No league selected</NoDataMessage>
            }

            {/* Player/defense stat overlays */}
            {showOverlay &&
                <Overlay isOpen={showOverlay} onClose={() => setShowOverlay(false)}>
                    {selectedPlayer && (
                        <PlayerStatsOverlay
                            player={selectedPlayer}
                            onPlayerDelete={onPlayerDelete}
                        />
                    )}

                    {selectedDefense && (
                        <DefenseStatsOverlay
                            defense={selectedDefense}
                            onDeleteDefense={onDefenseDelete}
                        />
                    )}
                </Overlay>
            }

            {/* Advice cache modal */}
            <ConfirmAdviceModal
                isOpen={showAdviceModal}
                onClose={() => setShowAdviceModal(false)}
                onUseCached={handleUseCached}
                onRegenerate={handleRegenerate}
            />

            {/* Confirm start/sit toggle */}
            <ConfirmSwapModal
                isOpen={showSwapModal}
                target={swapTarget}
                onClose={() => setShowSwapModal(false)}
                onConfirm={handleConfirmStartSit}
            />

            {/* Swap selection when position is full */}
            <SwapSelectionModal
                isOpen={showSwapSelectionModal}
                onClose={() => setShowSwapSelectionModal(false)}
                choices={swapChoices}
                onSelect={async (choice) => {
                    // Bench the chosen existing starter
                    await performPickedSwap(choice);
                    // Then start the new desired target
                    await performPickedSwap(swapTarget!);
                }}
            />

            {/* Add league modal */}
            <AddLeagueOverlay
                isOpen={showAddLeagueModal}
                onClose={() => setShowAddLeagueModal(false)}
                onCreate={handleCreateLeague}
            />
        </AppNavWrapper>
    );
}
