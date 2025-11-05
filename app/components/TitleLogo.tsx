import Image from "next/image";
import styled from "styled-components";

const LogoLink = styled.a`
  display: inline-block;
  text-decoration: none;
  cursor: pointer;
  transition: transform 0.3s ease; /* smooth animation */

  &:hover {
    transform: scale(1.1);
  }
`;

export default function TitleLogo() {
    return (
        <LogoLink href="/">
            <Image
                src="/images/logo.png"
                alt="Fantasy Football Assistant Logo"
                width={250}
                height={250}
                priority
            />
        </LogoLink>
    );
}
