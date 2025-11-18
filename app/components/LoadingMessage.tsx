import LoadingSpinner from "./LoadingSpinner";
import styled from "styled-components";

const MessageContainer = styled.div`
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
`;

interface LoadingMessageProps {
    message?: string;
}

export default function LoadingMessage({ message = "Loading..." }: LoadingMessageProps) {
    return (
        <MessageContainer>
            <LoadingSpinner size={50} />{message}
        </MessageContainer>
    );
}