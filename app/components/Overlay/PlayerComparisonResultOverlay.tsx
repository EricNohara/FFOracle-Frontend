"use client";

import { useEffect, useState } from "react";
import Overlay from "./Overlay";
import styled from "styled-components";
import LoadingMessage from "../LoadingMessage";
import { PrimaryColorButton } from "../Buttons";

import { IPlayerData, ILeagueDefense } from "@/app/interfaces/IUserData";
import { authFetch } from "@/lib/supabase/authFetch";

interface AIRecommendation {
    position: string;
    playerId: string;
    picked: boolean;
    reasoning: string;
}

interface RecommendationResponse {
    recommendations: AIRecommendation[];
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    targetPlayer: IPlayerData | ILeagueDefense | null;
    comparePlayer: IPlayerData | ILeagueDefense | null;
    leagueId: string;
}

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  background: var(--color-base-dark);
  border-radius: var(--global-border-radius);
  color: white;
  padding: 2rem;
  overflow-y: auto;
`;

const Title = styled.h1`
  font-size: 2rem;
  text-align: center;
  font-weight: bold;
`;

// --- new styled components ---
const CompareCard = styled.div`
  display: flex;
  gap: 2rem;
  margin-top: 2rem;
  background: var(--color-base-dark-3);
  padding: 2rem;
  border-radius: var(--global-border-radius);
  align-items: center;
`;

const Headshot = styled.img`
  width: 150px;
  height: 150px;
  object-fit: cover;
  flex-shrink: 0;
  border-radius: 50%;
  background-color: white;
`;

const InfoSection = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const TopRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  justify-content: space-between;
  align-items: center;
`;

const PlayerName = styled.h2`
  font-size: 1.25rem;
  font-weight: bold;
  margin: 0;
`;

const StatusBadge = styled.span<{ $picked: boolean }>`
  background-color: ${({ $picked }) =>
        $picked ? "var(--color-green)" : "var(--color-red)"};
  color: white;
  padding: 0.5rem 1rem;
  border-radius: var(--global-border-radius);
  font-weight: bold;
  text-transform: uppercase;
  font-size: 0.9rem;
`;

const ReasoningText = styled.p`
  color: var(--color-txt-2);
  line-height: 1.4rem;
  white-space: pre-wrap;
  font-size: 0.9rem;
`;

export default function PlayerComparisonResultOverlay({
    isOpen,
    onClose,
    targetPlayer,
    comparePlayer,
    leagueId,
}: Props) {
    const [loading, setLoading] = useState(true);
    const [recommendations, setRecommendations] = useState<AIRecommendation[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    const isDefenseType = (x: any): x is ILeagueDefense =>
        x && typeof x === "object" && "team" in x;

    const isPlayerType = (x: any): x is IPlayerData =>
        x && typeof x === "object" && "player" in x;

    // Safe defaults before data exists
    const targetId =
        targetPlayer && isDefenseType(targetPlayer)
            ? targetPlayer.team.id
            : targetPlayer && isPlayerType(targetPlayer)
                ? targetPlayer.player.id
                : null;

    const compareId =
        comparePlayer && isDefenseType(comparePlayer)
            ? comparePlayer.team.id
            : comparePlayer && isPlayerType(comparePlayer)
                ? comparePlayer.player.id
                : null;

    const position =
        targetPlayer && isDefenseType(targetPlayer)
            ? "DEF"
            : targetPlayer && isPlayerType(targetPlayer)
                ? targetPlayer.player.position
                : null;

    // -------------------------
    // Fetch AI data when overlay opens
    // -------------------------
    useEffect(() => {
        if (!isOpen || !targetId || !compareId || !position) return;

        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                const res = await authFetch(
                    `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/PlayerComparison/${targetId}/${compareId}/${position}?leagueId=${leagueId}`,
                    { credentials: "include" }
                );

                if (!res.ok) throw new Error(`HTTP ${res.status}`);

                const json: RecommendationResponse = await res.json();

                console.log(json.recommendations);

                setRecommendations(json.recommendations ?? []);
            } catch (err: any) {
                setError(err.message ?? "Failed to load comparison");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [isOpen, targetId, compareId, position, leagueId]);

    if (!isOpen) return null;
    if (!targetPlayer || !comparePlayer) return null;

    if (loading) {
        return (
            <Overlay isOpen={isOpen} onClose={onClose}>
                <Wrapper>
                    <LoadingMessage
                        intervalMs={1000}
                        messages={[
                            "Gathering player data...",
                            "Fetching league settings...",
                            "Analyzing betting odds...",
                            "Comparing opponent stats...",
                            "Analyzing game environment...",
                            "Accounting for historical performances...",
                            "Finalizing recommendations...",
                        ]}
                    />
                </Wrapper>
            </Overlay>
        );
    }

    return (
        <Overlay isOpen={isOpen} onClose={onClose} height={90}>
            <Wrapper>
                <Title>AI Comparison Result</Title>

                {error && <p style={{ color: "var(--color-red)" }}>{error}</p>}

                {recommendations?.map((rec) => {
                    // determine which player's data this rec belongs to
                    const isTarget = rec.playerId === targetId;

                    const data = isTarget ? targetPlayer : comparePlayer;

                    const img = isDefenseType(data)
                        ? data.team.logo_url
                        : data.player.headshot_url;

                    const name = isDefenseType(data)
                        ? data.team.name
                        : data.player.name;

                    return (
                        <CompareCard key={rec.playerId}>
                            <TopRow>
                                <Headshot
                                    src={img || "default-player.png"}
                                    alt={name}
                                />
                                <PlayerName>{name}</PlayerName>
                                <StatusBadge $picked={rec.picked}>
                                    {rec.picked ? "START" : "SIT"}
                                </StatusBadge>
                            </TopRow>

                            <InfoSection>
                                <ReasoningText>{rec.reasoning}</ReasoningText>
                            </InfoSection>
                        </CompareCard>
                    );
                })}
            </Wrapper>
        </Overlay>
    );
}
