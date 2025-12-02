import styled from "styled-components";
import { useRouter } from "next/navigation";
import TitleLogo from "../TitleLogo";
import { LayoutDashboard, BookText, ChartColumnBig, CircleGauge, Settings, LogOut } from "lucide-react";
import { LucideIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { usePathname } from "next/navigation";

const Nav = styled.nav`
    width: 350px;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    background-color: var(--color-base-dark);
    padding: 2rem 1.5rem;

    @media (max-width: 768px) {
        width: 100%;
        height: auto;
        padding: 1rem;
        flex-direction: row;
        justify-content: space-around;
        overflow-x: auto;
    }
`;

const NavList = styled.ul`
  list-style: none;
  padding: 0;
  width: 100%;
  margin-top: 3rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: row;
    margin-top: 0;
    gap: 0.5rem;
    overflow-x: auto;
  }
`;

const NavItem = styled.li<{ $isActive?: boolean }>`
  display: flex;
  align-items: center;
  gap: 1rem;
  background-color: ${({ $isActive }) => ($isActive ? "var(--color-primary)" : "var(--color-base-dark)")};
  cursor: pointer;
  font-weight: bold;
  transition: 0.2s ease;
  color: white;
  padding: 0.75rem 1rem;
  width: 100%;
  border-radius: var(--global-border-radius);

  &:hover {
    background-color: var(--color-base-dark-4);
  }

  @media (max-width: 768px) {
    width: auto;
    min-width: fit-content;
    padding: 0.5rem;
    gap: 0.5rem;
    font-size: 0.85rem;
    white-space: nowrap;
  }
`;

const TopContainer = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    @media (max-width: 768px) {
        flex-direction: row;
        width: auto;
        gap: 0.5rem;
    }
`;

interface INavItem {
    icon: LucideIcon;
    label: string;
    route: string;
}

export default function AppNav() {
    const router = useRouter();
    const supabase = createClient();
    const pathname = usePathname();

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/");
    }

    const navListTop: INavItem[] = [
        { icon: LayoutDashboard, label: "Dashboard", route: "/dashboard" },
        { icon: BookText, label: "Articles", route: "/articles" },
        { icon: ChartColumnBig, label: "Stats", route: "/stats" },
        { icon: CircleGauge, label: "Performance", route: "/performance" },
        { icon: Settings, label: "Settings", route: "/settings" },
    ]

    return (
        <Nav>
            <TopContainer>
                <TitleLogo />
                <NavList>
                    {navListTop.map(({ icon: Icon, label, route }) => (
                        <NavItem key={label} onClick={() => router.push(route)} $isActive={pathname === route}>
                            <Icon />
                            {label}
                        </NavItem>
                    ))}
                </NavList>
            </TopContainer>
            <NavItem onClick={handleSignOut}>
                <LogOut />
                Sign Out
            </NavItem>
        </Nav>
    );
}