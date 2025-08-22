// src/context/UserContext.tsx
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User } from "@prisma/client";

type UserContextType = {
    user: User | null;
    setUser: (u: User | null) => void;
    refreshUser: () => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);

    const fetchUser = async () => {
        try {
            const res = await fetch("/api/users/me");
            if (res.ok) {
                const data: User = await res.json();
                setUser(data);
            } else {
                setUser(null);
            }
        } catch {
            setUser(null);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    return (
        <UserContext.Provider value={{ user, setUser, refreshUser: fetchUser }}>
            {children}
        </UserContext.Provider>
    );
};

// Hook pratique
export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
};
