"use client";

import styled from "styled-components";
import Overlay from "./Overlay";
import { IAiAdviceResponse } from "@/app/interfaces/IAiAdviceResponse";
import { IPlayerData, ILeagueDefense } from "@/app/interfaces/IUserData";
import { PlayerPositionTag } from "@/app/components/PlayerList";
import { formatGameInfo, formatTeamGameInfo } from "@/lib/utils/formatGameInfo";
import { Search } from "lucide-react";
import { PrimaryColorButton } from "../Buttons";
import { useState } from "react";
import PlayerCompareOverlay from "./PlayerCompareOverlay";
import PlayerComparisonResultOverlay from "./PlayerComparisonResultOverlay";

interface AdviceReasoningOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    advice: IAiAdviceResponse;
    playerData: IPlayerData | null;
    defenseData: ILeagueDefense | null;
    leagueId: string;
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  background-color: var(--color-base-dark-3);
  border-radius: var(--global-border-radius);
  color: white;
`;

const Header = styled.div`
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

const Body = styled.div`
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

const CompareButtonWrapper = styled.div`
  position: absolute;
  bottom: 1rem;
  right: 1rem;
`;

export default function AdviceReasoningOverlay({
    isOpen,
    onClose,
    advice,
    playerData,
    defenseData,
    leagueId
}: AdviceReasoningOverlayProps) {
    if (!advice) return null;

    const [showCompareOverlay, setShowCompareOverlay] = useState(false);
    const [showCompareResult, setShowCompareResult] = useState(false);
    const [compareWith, setCompareWith] = useState<IPlayerData | ILeagueDefense | null>(null);

    const isDefense = advice.position === "DEF";

    return (
        <>
            <Overlay isOpen={isOpen} onClose={onClose}>
                <Wrapper>
                    <Header>
                        <PlayerImage
                            src={
                                !isDefense
                                    ? playerData?.player.headshot_url ?? "default-player.png"
                                    : defenseData?.team.logo_url ?? "default-defense.png"
                            }
                            alt={!isDefense ? playerData?.player.name : defenseData?.team.name}
                        />

                        <NameStack>
                            <h1>{!isDefense ? playerData?.player.name : defenseData?.team.name}</h1>

                            {/* PLAYER INFO */}
                            {!isDefense && playerData && (
                                <>
                                    <h2>
                                        {playerData.player.team_id +
                                            " " +
                                            formatGameInfo(playerData.game, playerData.player)}
                                    </h2>
                                    {playerData.game && (
                                        <>
                                            <h2>{playerData.game.stadium_name}</h2>
                                        </>
                                    )}
                                    <h2>{playerData.player.status_description}</h2>
                                </>
                            )}

                            {/* DEFENSE INFO */}
                            {isDefense && defenseData && (
                                <>
                                    <h2>
                                        {defenseData.team.id +
                                            " " +
                                            formatTeamGameInfo(playerData?.game, defenseData)}
                                    </h2>

                                    {defenseData.game && (
                                        <>
                                            <h2>{defenseData.game.stadium_name}</h2>
                                        </>
                                    )}
                                </>
                            )}
                        </NameStack>

                        <PositionTagWrapper>
                            <PlayerPositionTag position={advice.position}>
                                {advice.position}
                            </PlayerPositionTag>
                        </PositionTagWrapper>

                        <CompareButtonWrapper>
                            <PrimaryColorButton onClick={() => setShowCompareOverlay(true)}>
                                <p style={{ display: "flex", gap: "1rem", alignItems: "center", justifyContent: "center" }}>
                                    <Search /> Compare
                                </p>
                            </PrimaryColorButton>
                        </CompareButtonWrapper>
                    </Header>

                    <Body>
                        <div>
                            <h3>Status:</h3>
                            <p
                                style={{
                                    fontWeight: "bold",
                                    color: advice.picked ? "var(--color-green)" : "var(--color-red)",
                                }}
                            >
                                {advice.picked ? "Start" : "Sit"}
                            </p>
                        </div>

                        <div>
                            <h3>Reasoning:</h3>
                            <p style={{ color: "var(--color-txt-2)" }}>{advice.reasoning}</p>
                        </div>
                    </Body>
                </Wrapper>
            </Overlay>

            <PlayerCompareOverlay
                isOpen={showCompareOverlay}
                onClose={() => setShowCompareOverlay(false)}
                targetPlayer={playerData ?? defenseData!}
                onSelect={(selectedPlayer) => {
                    setCompareWith(selectedPlayer);
                    setShowCompareOverlay(false);
                    setShowCompareResult(true);
                }}
            />

            <PlayerComparisonResultOverlay
                isOpen={showCompareResult}
                onClose={() => setShowCompareResult(false)}
                targetPlayer={playerData ?? defenseData!}
                comparePlayer={compareWith!}
                leagueId={leagueId!}
            />
        </>
    );
}
