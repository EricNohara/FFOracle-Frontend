"use client";

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

export default function SwapSelectionModal({
    isOpen,
    onClose,
    choices,
    onSelect
}: SwapSelectionModalProps) {

    return (
        <Overlay isOpen={isOpen} onClose={onClose}>
            <div style={{ padding: "4rem", color: "white" }}>
                <h1 style={{ marginBottom: "1rem", fontSize: "2rem", fontWeight: "bold", color: "white" }} className={headerFont.className}>
                    You have too many starters!
                </h1>
                <h2 style={{ marginBottom: "2rem", fontSize: "1rem", color: "var(--color-txt-3)" }}>
                    Choose a player to send to the bench.
                </h2>

                <PlayerList
                    players={choices.filter(c => "player" in c) as IPlayerData[]}
                    defenses={choices.filter(c => "team" in c) as ILeagueDefense[]}
                    displayStartSit={false}
                    onPlayerClick={onSelect}
                    onDefenseClick={onSelect}
                />
            </div>
        </Overlay>
    );
}
