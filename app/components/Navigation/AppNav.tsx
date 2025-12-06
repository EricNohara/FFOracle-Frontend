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
`;

const TopContainer = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
`;

interface INavItem {
    icon: LucideIcon;
    label: string;
    route: string;
    id: string;
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
        { icon: LayoutDashboard, label: "Dashboard", route: "/dashboard", id: "step-dashboard" },
        { icon: ChartColumnBig, label: "Stats", route: "/stats", id: "step-stats" },
        { icon: CircleGauge, label: "Performance", route: "/performance", id: "step-performance" },
        { icon: BookText, label: "Articles", route: "/articles", id: "step-articles" },
        { icon: Settings, label: "Settings", route: "/settings", id: "step-settings" },
    ]

    return (
        <Nav>
            <TopContainer>
                <TitleLogo />
                <NavList>
                    {navListTop.map(({ icon: Icon, label, route, id }) => (
                        <NavItem id={id} key={label} onClick={() => router.push(route)} $isActive={pathname === route}>
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