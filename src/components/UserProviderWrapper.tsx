// src/components/UserProviderWrapper.tsx
"use client";

import { ReactNode } from "react";
import { UserProvider } from "@/context/UserContext";

export default function UserProviderWrapper({ children }: { children: ReactNode }) {
    return <UserProvider>{children}</UserProvider>;
}
