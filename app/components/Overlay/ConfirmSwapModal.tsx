"use client";

import styled from "styled-components";
import Overlay from "./Overlay";
import { IPlayerData, ILeagueDefense } from "@/app/interfaces/IUserData";
import { headerFont } from "@/app/localFont";

interface ConfirmSwapModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    target: IPlayerData | ILeagueDefense | null;
}

const ModalContainer = styled.div`
    padding: 2.5rem;
    text-align: center;
    color: white;
`;

const Title = styled.h2`
    margin: 0;
    font-size: 1.75rem;
    font-weight: bold;
    margin-bottom: 1.25rem;
    color: white;
`;

const Message = styled.p`
    font-size: 1.1rem;
    color: var(--color-txt-2);
    line-height: 1.6;
    margin-bottom: 2rem;
`;

const Highlight = styled.span<{ $start: boolean }>`
    font-weight: bold;
    color: ${({ $start }) => ($start ? "var(--color-red)" : "var(--color-green)")};
`;

const ButtonRow = styled.div`
    display: flex;
    justify-content: center;
    gap: 1rem;
`;

const CancelButton = styled.button`
    padding: 0.75rem 1.5rem;
    border-radius: var(--global-border-radius);
    background: var(--color-base-dark-4);
    font-weight: bold;
    cursor: pointer;
    transition: 0.2s;

    &:hover {
        background: var(--color-base-dark);
        transform: translateY(-1px);
        color: white;
    }
    &:active {
        transform: translateY(0);
    }
`;

const ConfirmButton = styled.button`
    padding: 0.75rem 1.5rem;
    border-radius: var(--global-border-radius);
    background: var(--color-primary);
    border: none;
    font-weight: bold;
    color: white;
    cursor: pointer;
    transition: 0.2s;

    &:hover {
        background-color: var(--color-primary-hover);
        transform: translateY(-1px);
    }
    &:active {
        transform: translateY(0);
    }
`;

export default function ConfirmSwapModal({
    isOpen,
    onClose,
    onConfirm,
    target,
}: ConfirmSwapModalProps) {
    if (!target) return null;

    const isPlayer = (t: IPlayerData | ILeagueDefense): t is IPlayerData =>
        (t as IPlayerData).player !== undefined;

    const name = isPlayer(target) ? target.player.name : target.team.name;
    const isStart = target.picked;

    return (
        <Overlay isOpen={isOpen} onClose={onClose} height={30}>
            <ModalContainer>
                <Title className={headerFont.className}>Confirm Change</Title>

                <Message>
                    Move <b>{name}</b> to{" "}
                    <Highlight $start={isStart}>
                        {isStart ? "Sit" : "Start"}
                    </Highlight>
                    ?
                </Message>

                <ButtonRow>
                    <CancelButton onClick={onClose}>Cancel</CancelButton>
                    <ConfirmButton onClick={onConfirm}>Confirm</ConfirmButton>
                </ButtonRow>
            </ModalContainer>
        </Overlay>
    );
}
