"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { IUserData } from "../interfaces/IUserData";
import { createClient } from "@/lib/supabase/client";

interface IUserDataContext {
    userData: IUserData | null;
    isLoading: boolean;
    refreshUserData: () => Promise<void>;
}

const UserDataContext = createContext<IUserDataContext | undefined>(undefined);

const supabase = createClient();

// provider which gives all child components context to a user's data from the backend
export function UserDataProvider({ children }: { children: ReactNode }) {
    const [userData, setUserData] = useState<IUserData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // function to call our backend to get user data
    const fetchUserData = async () => {
        setIsLoading(true);

        // get current session
        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData?.session?.access_token;

        if (!accessToken) {
            setUserData(null);
            setIsLoading(false);
            return;
        }

        try {
            // make the request with the access token
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/GetUserData`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            if (!res.ok) {
                throw new Error("Failed to fetch user data");
            }

            const data: IUserData = await res.json();

            // set the user data
            setUserData(data);
        } catch (error) {
            console.error("Error fetching user data:", error);
            setUserData(null);
        } finally {
            setIsLoading(false);
        }
    };

    // call the fetch user data on load
    useEffect(() => {
        fetchUserData();
    }, []);

    // provide child components with the user data and a function to refresh the user data
    return (
        <UserDataContext.Provider
            value={{ userData, isLoading, refreshUserData: fetchUserData }}
        >
            {children}
        </UserDataContext.Provider>
    );
}

// Custom hook to consume context
export const useUserData = () => {
    const context = useContext(UserDataContext);
    if (!context) {
        throw new Error("useUserData must be used within a UserDataProvider");
    }
    return context;
};