"use client";

import styled from "styled-components";
import Overlay from "../Overlay/Overlay";
import { PrimaryColorButton, SecondaryColorButton } from "../Buttons";
import { headerFont } from "../../localFont";

const ModalWrapper = styled.div`
  background-color: var(--color-base-dark-3);
  padding: 4rem;
  border-radius: var(--global-border-radius);
  color: white;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  align-items: center;
  justify-content: center;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 2rem;
  font-weight: bold;
  color: white;
`;

const Message = styled.p`
  color: var(--color-txt-2);
  margin: 0;
  line-height: 1.5;

  & > strong {
    color: var(--color-primary);
  }
`;

const ButtonRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

interface ConfirmAdviceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUseCached: () => void;
    onRegenerate: () => void;
}

export default function ConfirmAdviceModal({
    isOpen,
    onClose,
    onUseCached,
    onRegenerate,
}: ConfirmAdviceModalProps) {
    return (
        <Overlay isOpen={isOpen} onClose={onClose} height={50}>
            <ModalWrapper>
                <Title className={headerFont.className}>AI Advice Available...</Title>

                <Message>
                    You already generated AI roster advice for your current roster this week.
                    Would you like to <strong>view your previous advice for free</strong>,
                    or <strong>regenerate new advice for 10 tokens</strong>?
                </Message>

                <ButtonRow>
                    <PrimaryColorButton onClick={onUseCached}>
                        View Previous Advice (Free)
                    </PrimaryColorButton>

                    <SecondaryColorButton onClick={onRegenerate}>
                        Regenerate Advice (10 Tokens)
                    </SecondaryColorButton>

                    <button
                        style={{
                            marginTop: "1rem",
                            background: "transparent",
                            border: "none",
                            color: "var(--color-txt-3)",
                            cursor: "pointer",
                        }}
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                </ButtonRow>
            </ModalWrapper>
        </Overlay>
    );
}
