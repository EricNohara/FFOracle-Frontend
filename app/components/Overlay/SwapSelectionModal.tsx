"use client";

import styled from "styled-components";
import Overlay from "./Overlay";
import PlayerList from "../PlayerList";
import { IPlayerData, ILeagueDefense } from "@/app/interfaces/IUserData";
import { headerFont } from "@/app/localFont";

interface SwapSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    choices: (IPlayerData | ILeagueDefense)[];
    onSelect: (choice: IPlayerData | ILeagueDefense) => void;
}

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const Header = styled.div`
  padding: 2rem 4rem 0 4rem;
  color: white;
  flex-shrink: 0;
`;

const Content = styled.div`
  padding: 0 4rem 4rem 4rem;
  color: white;
  overflow-y: auto;
  flex: 1;
`;

export default function SwapSelectionModal({
    isOpen,
    onClose,
    choices,
    onSelect
}: SwapSelectionModalProps) {

    return (
        <Overlay isOpen={isOpen} onClose={onClose}>
            <Wrapper>
                <Header>
                    <h1 style={{ marginBottom: "1rem", fontSize: "2rem", fontWeight: "bold", color: "white" }} className={headerFont.className}>
                        You have too many starters!
                    </h1>
                    <h2 style={{ marginBottom: "2rem", fontSize: "1rem", color: "var(--color-txt-3)" }}>
                        Choose a player to send to the bench.
                    </h2>
                </Header>

                <Content>
                    <PlayerList
                        players={choices.filter(c => "player" in c) as IPlayerData[]}
                        defenses={choices.filter(c => "team" in c) as ILeagueDefense[]}
                        displayStartSit={false}
                        onPlayerClick={onSelect}
                        onDefenseClick={onSelect}
                    />
                </Content>
            </Wrapper>
        </Overlay>
    );
}
